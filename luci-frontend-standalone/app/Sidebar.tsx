import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import EclapseIcon from "./v2/assets/figma/eclapse.svg?react";
import {
  createPrimaryNavigationItems,
  type PrimaryNavigationItemId,
} from "./v2/components/navigationRail";
import luciCLight from "./v2/assets/figma/lightC.svg";
import luciCDark from "./v2/assets/figma/darkC.svg";
import luciWordmarkLight from "./v2/assets/figma/lightLogo.svg";
import luciWordmarkDark from "./v2/assets/figma/nightLogo.svg";

function SidebarRow({
  item,
  onClick,
}: {
  item: ReturnType<typeof createPrimaryNavigationItems>[number];
  onClick?: () => void;
}) {
  const maskSrc = item.inactiveIcon;
  const iconColor = item.active ? "var(--luci-accent)" : "var(--text-1)";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-9 w-full items-center gap-1.5 rounded-lg px-3 py-2 transition-colors md:px-4 ${
        item.active
          ? "bg-[var(--luci-border-strong)]"
          : "bg-transparent hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      <span aria-hidden className="relative block h-5 w-5 shrink-0 overflow-hidden">
        <span
          className={`absolute ${item.inactiveInsetClassName}`}
          style={{
            backgroundColor: iconColor,
            WebkitMaskImage: `url(${maskSrc})`,
            maskImage: `url(${maskSrc})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
          }}
        />
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-left text-sm leading-5 ${
          item.active
            ? "font-medium text-[var(--luci-accent)]"
            : "font-normal text-[var(--text-1)]"
        }`}
      >
        {item.label}
      </span>
    </button>
  );
}

const NAV_TARGETS: Record<PrimaryNavigationItemId, string> = {
  "ask-luci": "Home",
  memories: "Memories",
  settings: "Settings",
  shadcn: "Shadcn",
  "css-vars": "CSS Vars",
};

export function Sidebar({
  activeTab,
  onChangeTab,
  theme,
  onToggleTheme,
}: {
  activeTab: PrimaryNavigationItemId;
  onChangeTab: (tab: PrimaryNavigationItemId) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const SIDEBAR_MIN = 216;
  const SIDEBAR_MAX = 320;
  const SIDEBAR_STORAGE_KEY = "luci.sidebar.width.design";
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const raw = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    if (!Number.isFinite(n)) return SIDEBAR_MIN;
    return Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, n));
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ x: number; w: number } | null>(null);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const start = resizeStartRef.current;
      if (!start) return;
      setSidebarWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, start.w + e.clientX - start.x)));
    };
    const onUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
    };
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [isResizing]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarWidth));
  }, [sidebarWidth]);

  const sidebarItems = createPrimaryNavigationItems(activeTab);

  return (
    <>
      <AnimatePresence initial={false}>
        {!sidebarCollapsed && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0, marginRight: 0 }}
            animate={{ width: sidebarWidth, opacity: 1, marginRight: 0 }}
            exit={{ width: 0, opacity: 0, marginRight: -16 }}
            transition={isResizing ? { duration: 0 } : { duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="relative flex h-full shrink-0 select-none flex-col overflow-hidden rounded-2xl bg-grey-0 shadow-[var(--luci-panel-shadow)] md:rounded-[18px]"
          >
            <div className="h-[46px] shrink-0" />

            <div className="flex flex-1 flex-col gap-5 px-3 pb-4 md:gap-6 md:px-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--luci-surface-bg)] md:h-11 md:w-11">
                  <img src={theme === "dark" ? luciCDark : luciCLight} alt="LUCI" className="block h-[33px] w-[33px] select-none" draggable={false} />
                </div>
                <img src={theme === "dark" ? luciWordmarkDark : luciWordmarkLight} alt="LUCI" className="h-5 w-[55px] select-none md:h-[23.467px] md:w-[65.286px]" draggable={false} />
              </div>

              <nav className="flex flex-col gap-2">
                {sidebarItems.map((item) => (
                  <SidebarRow key={item.id} item={item} onClick={() => onChangeTab(item.id)} />
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="flex h-9 w-full items-center justify-between rounded-lg border border-[var(--luci-border)] bg-[var(--luci-surface-bg)] px-3 text-left text-sm font-medium text-[var(--text-0)] transition-colors hover:bg-[var(--luci-surface-hover)] md:px-4"
                >
                  <span>Theme</span>
                  <span className="rounded-full bg-[var(--luci-surface-soft)] px-2 py-0.5 text-xs text-[var(--text-1)]">
                    {theme === "dark" ? "Dark" : "Light"}
                  </span>
                </button>

                <div className="rounded-xl border border-[var(--luci-border)] bg-[var(--luci-surface-bg)] p-3">
                  <p className="text-xs font-semibold text-[var(--text-0)]">Standalone frontend</p>
                  <p className="mt-1 text-xs leading-4 text-[var(--text-3)]">No Tauri. Safe for designers to edit React/CSS only.</p>
                </div>
              </div>
            </div>

            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize sidebar"
              onMouseDown={(e) => {
                e.preventDefault();
                resizeStartRef.current = { x: e.clientX, w: sidebarWidth };
                setIsResizing(true);
              }}
              className="absolute right-0 top-0 z-10 h-full w-1 cursor-ew-resize select-none"
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setSidebarCollapsed((v) => !v)}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        initial={false}
        animate={{ left: sidebarCollapsed ? 24 : 16 + sidebarWidth - 28 }}
        transition={isResizing ? { duration: 0 } : { duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        className="absolute top-7 z-20 flex h-5 w-5 items-center justify-center text-text-3 transition-colors hover:text-text-1"
      >
        <motion.span initial={false} animate={{ scaleX: sidebarCollapsed ? -1 : 1 }} transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }} className="flex">
          <EclapseIcon className="h-5 w-5" />
        </motion.span>
      </motion.button>

      <div className="pointer-events-none absolute bottom-5 left-5 z-30 text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)]">
        {NAV_TARGETS[activeTab]}
      </div>
    </>
  );
}
