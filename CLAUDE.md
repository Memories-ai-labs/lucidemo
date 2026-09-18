# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common commands

```sh
npm run tauri dev      # run the desktop client (Rust + Vite both rebuild on change)
npm run dev            # Vite only — opens http://localhost:1420 in a browser, no Tauri shell
npm run build          # tsc + vite build (writes dist/)
npm run tauri build    # produce a packaged macOS .app/.dmg
```

There is no test runner and no lint script. Type checking is part of `npm run build` (`tsc`). The nested `luci-frontend-standalone/` project has its own `bun run typecheck` for the standalone variant.

When the user says "运行客户端" / "run the client" they mean `npm run tauri dev`, not `npm run dev`. The latter only serves the webview without the Tauri shell, so Tauri-only APIs (`@tauri-apps/api/*`, IPC, global hotkey) will not work.

## Architecture

### Two webviews, one Rust process

`src-tauri/tauri.conf.json` declares two windows that share the same Rust backend:

- **`main`** (1100×720, transparent, overlay traffic lights) — entry `index.html` → `src/main.tsx` → `src/App.tsx`. The chat-style UI (sidebar, channels, memories).
- **`island`** (320×56, always-on-top, decorations off, hidden until invoked) — entry `island.html` → `src/island/main.tsx` → `src/island/Island.tsx`. A "dynamic island" pill at the top of the screen for voice capture.

Both webviews load from the same Vite dev server in dev (`http://localhost:1420`) and from `dist/` in production. **Note**: `vite.config.ts` only declares `main` in `rollupOptions.input` — if `island.html` is added/needed for production builds, the second input must be added there.

### Hotkey → island → main IPC flow (macOS only)

`src-tauri/src/lib.rs` is the load-bearing piece:

1. On startup, checks `AXIsProcessTrusted()`. If accessibility permission is missing, the hotkey is silently disabled (only a stderr message). Tell the user to grant Accessibility in System Settings.
2. Registers an `NSEvent.addGlobalMonitorForEventsMatchingMask` block on `FlagsChanged`. This watches modifier-key transitions process-wide.
3. Detects double-tap of the Option/⌥ key (two release events within 400 ms). First release arms; second release inside the threshold sends `HotkeySignal::Start`. Any release while recording sends `HotkeySignal::Stop`.
4. Signals are pushed through an `mpsc::channel` to a worker thread, which calls `win.emit("recording-start" | "recording-stop", ())` on the **island** window.
5. `Island.tsx` listens for those events, runs the browser Web Speech API (`zh-CN`), and on stop calls `invoke("send_to_channel", { text })`.
6. The Rust command `send_to_channel` re-emits `add-to-channel` to the **main** window. `App.tsx` listens for it and inserts the transcript into the active channel.

This is why `tauri = { features = ["macos-private-api"] }` and `transparent: true` are set on the main window. **Do not change `macOSPrivateApi` or remove the `objc2-app-kit` dep without understanding the hotkey path** — `tauri-plugin-global-shortcut` is in `Cargo.toml` but is not what drives recording; the NSEvent monitor is. The double-tap detection cannot be expressed with `global-shortcut`.

The NSEvent monitor is intentionally `mem::forget`'d so it lives for the app's lifetime.

### Frontend layout: main `src/` plus a vendored "standalone" component library

The project has an unusual two-tree layout:

- `src/` — the Tauri-facing entry. `src/App.tsx` composes the UI and contains all the Tauri-specific code (window dragging, IPC listeners, channel state).
- `luci-frontend-standalone/app/` — a self-contained React app + component library (own `package.json`, own `vite.config.ts`, own `tsconfig.json`, own `dist/`). It can run on its own (`bun run dev` inside that folder), but `src/App.tsx` also imports its components directly via relative paths and via the `~/` alias.

`vite.config.ts` and `tsconfig.json` both define `~/* → luci-frontend-standalone/app/*`. `src/main.tsx` imports `../luci-frontend-standalone/app/App.css` — that file owns the entire design-token system (CSS variables, `@font-face Manrope`, light/dark theming).

When editing UI:
- The Tauri shell behavior (window controls, IPC, hotkey integration) lives in `src/App.tsx` and `src/island/`.
- Reusable presentational components (`Modal`, `RegularButton`, `MenuBarTab`, `MemoryCard`, `Sidebar`, `navigationRail`, etc.) live in `luci-frontend-standalone/app/components/ui/` and `luci-frontend-standalone/app/v2/`. Edit them there; both the Tauri app and the standalone variant pick up the change.
- The standalone variant has its own `node_modules` and is **not** required to run the Tauri app — `npm install` at the root is enough.

`tsconfig.json` `include` is narrow: `src/main.tsx`, `src/island`, `src/vite-env.d.ts`. The standalone tree is excluded from the root tsc pass; it has its own typecheck.

### Design tokens (when changing UI styling)

`SKILL.md` at the repo root documents the design-system workflow used here. The token system in `luci-frontend-standalone/app/App.css` uses `--luci-*` (UI surfaces / borders / semantic colors), `--text-*` / `--bg-*` / `--grey-*` (base scale), and `--app*` (brand). All have light + `[data-theme="dark"]` definitions.

Hard rules carried over from `SKILL.md`:
- Never hardcode hex values in `className` — go through a `var(--…)` token.
- Never write `var(--semi-*)` / `var(--palette-*)` / `var(--corner-*)` — those are Figma's Semi Design names and **do not exist** in this project's CSS. They will silently fail. When `get_variable_defs` returns Semi names, look up the actual hex value and reverse-search `App.css` for the project token, or add a new `--luci-*` token (with a dark-mode counterpart).
- Don't pile up everything onto one breakpoint. Window minWidth is small enough that desktop-only sizes break narrow layouts; add an `md:` step for sizes ≥24 px.

### Tauri config gotchas

- Editing `src-tauri/tauri.conf.json` is **not hot-reloaded**. Restart `npm run tauri dev` after touching window size, traffic-light position, identifier, etc.
- The main window is `transparent: true` with `titleBarStyle: "Overlay"`. The traffic-light buttons are positioned at `{x: 32, y: 32}`. Frontend layouts that touch the top-left corner must leave a left-side gutter (~68 px) so the buttons don't overlap content.
- Capabilities are in `src-tauri/capabilities/default.json`; only the `main` window currently has them. Adding new Tauri commands or plugin permissions usually means editing this file plus `lib.rs::invoke_handler`.

## What's not here

- No tests, no CI config, no lint config.
- No router — the main window is a single `App.tsx` with internal state-driven view switching.
- The repo also contains `components.html` and a top-level `dist/` from earlier builds; these are not part of the active dev loop.
