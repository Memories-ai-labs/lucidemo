import { useMemo, useState } from "react";
import { CopyIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Toaster } from "~/components/ui/sonner";

const colorVariables = [
  "--text-0",
  "--text-1",
  "--text-3",
  "--bg-0",
  "--bg-1",
  "--grey-0",
  "--grey-1",
  "--warning-light-default",
  "--luci-shell-bg",
  "--luci-rail-bg",
  "--luci-content-bg",
  "--luci-surface-bg",
  "--luci-surface-tile",
  "--luci-surface-muted",
  "--luci-surface-soft",
  "--luci-surface-strong",
  "--luci-surface-hover",
  "--luci-border",
  "--luci-border-strong",
  "--luci-border-weak",
  "--luci-toggle-off-hover",
  "--luci-text-tertiary",
  "--luci-text-muted",
  "--luci-text-subtle",
  "--luci-accent",
  "--luci-accent-hover",
  "--app3",
  "--luci-link",
  "--luci-danger",
  "--luci-danger-hover",
  "--luci-warm-surface",
  "--luci-warm-surface-strong",
  "--luci-warm-tag",
  "--luci-overlay",
  "--luci-code-bg",
  "--luci-code-fg",
  "--luci-inline-code-bg",
  "--luci-toast-bg",
  "--luci-scrollbar-track",
  "--luci-scrollbar-idle",
  "--luci-scrollbar-active",
  "--luci-scrollbar-drag",
  "--luci-send-disabled",
  "--luci-loading-overlay",
  "--luci-placeholder-bg",
];

const effectVariables = [
  "--luci-floating-shadow",
  "--luci-panel-shadow",
  "--luci-mono-icon-filter",
  "--luci-logo-filter",
];

function VariableCard({ name, isColor = true }: { name: string; isColor?: boolean }) {
  const copy = async () => {
    await navigator.clipboard.writeText(`var(${name})`);
    toast.success(`Copied var(${name})`);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="group flex min-h-[88px] items-center gap-4 rounded-2xl border border-[var(--luci-border)] bg-[var(--luci-surface-tile)] p-3 text-left shadow-[var(--luci-floating-shadow)] transition-transform hover:-translate-y-0.5"
    >
      <span
        className="h-14 w-14 shrink-0 rounded-xl border border-[var(--luci-border-strong)] shadow-inner"
        style={{
          background: isColor ? `var(${name})` : "var(--luci-surface-bg)",
          boxShadow: isColor ? undefined : `var(${name})`,
        }}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[var(--text-0)]">{name}</span>
        <span className="mt-1 block break-all text-xs leading-4 text-[var(--text-3)]">var({name})</span>
        <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--luci-accent)] opacity-0 transition-opacity group-hover:opacity-100">
          <CopyIcon className="h-3 w-3" /> copy
        </span>
      </span>
    </button>
  );
}

export function CssVariablesShowcase() {
  const [query, setQuery] = useState("");
  const colors = useMemo(
    () => colorVariables.filter((name) => name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const effects = useMemo(
    () => effectVariables.filter((name) => name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="h-full bg-[var(--luci-surface-bg)] text-[var(--text-0)]">
      <Toaster position="top-center" richColors />
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-7xl space-y-5 px-8 py-8">
          <header className="rounded-[28px] border border-[var(--luci-border)] bg-[var(--luci-surface-tile)] p-6 shadow-[var(--luci-floating-shadow)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--luci-accent)]">App.css tokens</p>
            <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-[32px] font-extrabold leading-10 tracking-[-0.05em]">CSS color variables</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--luci-text-tertiary)]">
                  展示当前 App.css 里 light / dark theme 会用到的颜色变量。色块直接使用对应 CSS 变量，点击卡片会复制 var(--name)。
                </p>
              </div>
              <div className="flex gap-2">
                <label className="flex h-10 w-full min-w-[260px] items-center gap-2 rounded-2xl border border-[var(--luci-border)] bg-[var(--luci-surface-bg)] px-3 lg:w-[320px]">
                  <SearchIcon className="h-4 w-4 text-[var(--text-3)]" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search variable"
                    className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  />
                </label>

              </div>
            </div>
          </header>

          <section className="rounded-[24px] border border-[var(--luci-border)] bg-[var(--luci-surface-muted)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Color tokens</h2>
              <span className="text-xs text-[var(--text-3)]">{colors.length} tokens</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {colors.map((name) => (
                <VariableCard key={name} name={name} />
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-[var(--luci-border)] bg-[var(--luci-surface-muted)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Shadow / filter tokens</h2>
              <span className="text-xs text-[var(--text-3)]">{effects.length} tokens</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {effects.map((name) => (
                <VariableCard key={name} name={name} isColor={name.includes("filter")} />
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
