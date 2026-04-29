import { useState } from "react";
import { AlignJustify, LayoutList, Plus, ArrowUpRight, ArrowLeft } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";

interface Memory {
  id: number;
  title: string;
  date: string;
  duration: string;
  project: string;
  appType: "Slack" | "Discord" | "Teams" | "Gmail";
  summary?: string;
  sourceUrl?: string;
  participants: Array<{ id: number; avatar: string; name: string }>;
}

const APP_SOURCE_ICON: Record<string, string> = {
  Slack: "💬",
  Discord: "🎮",
  Teams: "📺",
  Gmail: "📧",
};

const mockMemoryList: Memory[] = [
  {
    id: 13,
    title: "Feature Kickoff — Notification System",
    date: "2026/04/11 10:00",
    duration: "50m",
    project: "Project A",
    appType: "Discord",
    summary: "Alice kicked off the notification system feature with a detailed breakdown of requirements and shared a Figma link covering 4 screen states. Charlie flagged a potential conflict with the existing push permission flow and suggested a brief sync before dev starts. Eve confirmed she could pick up the backend event schema this sprint without blocking the frontend work. The team agreed on a kickoff sync for Friday 10am to align on edge cases and mobile behaviour.",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
    ],
  },
  {
    id: 16,
    title: "Frontend Architecture Discussion",
    date: "2026/04/11 15:00",
    duration: "45m",
    project: "Project A",
    appType: "Gmail",
    summary: "Bob sent a detailed email outlining three frontend architecture options — monorepo split, micro-frontend, and a feature-folder restructure — with pros and cons for each. Frank replied with a performance benchmark comparing bundle sizes across the options, noting the feature-folder approach shipped fastest in his test environment.",
    participants: [
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=9", name: "Iris" },
    ],
  },
  {
    id: 18,
    title: "Stakeholder Demo — Beta Build",
    date: "2026/04/11 16:00",
    duration: "1h 10m",
    project: "Project B",
    appType: "Discord",
    summary: "Alice walked stakeholders through the beta build's three core flows — onboarding, dashboard, and settings — using the staging environment via screen share. Bob handled live Q&A and noted two out-of-scope feature requests from attendees, logging them to the backlog for future sprint consideration.",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8", name: "Henry" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=10", name: "Jack" },
    ],
  },
  {
    id: 14,
    title: "API Design Review",
    date: "2026/04/09 14:30",
    duration: "1h 05m",
    project: "Project A",
    appType: "Teams",
    summary: "Bob walked through the proposed REST structure for three new endpoints and Diana immediately raised concerns about pagination consistency with existing routes. Frank suggested adopting cursor-based pagination to align with what the mobile client already expects.",
    participants: [
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8", name: "Henry" },
    ],
  },
  {
    id: 15,
    title: "Sprint Planning — Q2",
    date: "2026/04/09 09:30",
    duration: "1h 20m",
    project: "Project A",
    appType: "Slack",
    summary: "Alice shared the sprint board and walked through 14 candidate tickets, opening the floor for estimates and blockers before committing anything. Bob flagged that the search indexing task was blocked on a data team dependency and proposed sliding it to the following sprint.",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
    ],
  },
  {
    id: 17,
    title: "Bug Triage — Release 2.1",
    date: "2026/04/09 11:00",
    duration: "35m",
    project: "Project B",
    appType: "Slack",
    summary: "Charlie opened the triage thread with a list of 7 bugs flagged from the 2.1 release candidate. Eve confirmed 3 were already fixed in her branch and would be merged by end of day, clearing the highest-priority items immediately.",
    participants: [
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=7", name: "Grace" },
      { id: 11, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=11", name: "Kate" },
    ],
  },
  {
    id: 1,
    title: "Q1 Planning Meeting",
    date: "2025/04/11 14:03",
    duration: "1h 23m",
    project: "Project C",
    appType: "Slack",
    summary: "Aligned on Q1 goals and assigned owners for each workstream.",
    sourceUrl: "slack://channel?team=T123&id=C456",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
    ],
  },
  {
    id: 9,
    title: "Board Presentation Prep",
    date: "2025/03/07 14:00",
    duration: "1h 30m",
    project: "Project A",
    appType: "Teams",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
    ],
  },
];

const ALL_PROJECTS = ["All", "Project A", "Project B", "Project C", "Untitled"];

type MemoryTab = "meetings" | "people" | "library" | "daily";

const TAB_LABELS: Record<MemoryTab, string> = {
  meetings: "Project",
  people: "People",
  library: "Library",
  daily: "Daily",
};

const mockDailyActivities = [
  { id: 101, date: "2026-04-13", time: "09:05", duration: 18, appIcon: "✉️", title: "Checked morning emails", summary: "Reviewed 14 emails, replied to 6 including client feedback and team standup notes." },
  { id: 102, date: "2026-04-13", time: "09:48", duration: 35, appIcon: "📝", title: "Weekly planning session", summary: "Set priorities for the week, created 9 tasks across 3 projects and updated the roadmap board." },
  { id: 103, date: "2026-04-13", time: "10:30", duration: 75, appIcon: "🎨", title: "Iterated on dashboard layout", summary: "Explored 4 layout variations for the analytics dashboard and aligned components to the 8px grid." },
  { id: 104, date: "2026-04-13", time: "11:15", duration: 22, appIcon: "💬", title: "Synced with design team", summary: "Discussed typography decisions and agreed on a shared type scale for the design system." },
  { id: 105, date: "2026-04-13", time: "13:20", duration: 45, appIcon: "💻", title: "Refactored state management", summary: "Extracted 3 custom hooks and reduced component re-renders by consolidating related state." },
  { id: 106, date: "2026-04-13", time: "14:10", duration: 28, appIcon: "🌐", title: "Researched animation libraries", summary: "Compared Framer Motion, GSAP and CSS transitions, took notes on performance tradeoffs." },
  { id: 107, date: "2026-04-13", time: "15:00", duration: 60, appIcon: "📹", title: "Sprint planning meeting", summary: "Estimated 12 story points with the team and broke down 5 epics into actionable tickets." },
  { id: 108, date: "2026-04-13", time: "16:05", duration: 80, appIcon: "🎨", title: "Updated component library", summary: "Added dark mode variants to 8 components and documented usage guidelines in the design system." },
];

export function MemoriesMock() {
  const [memoryTab, setMemoryTab] = useState<MemoryTab>("meetings");
  const [memoryFilter, setMemoryFilter] = useState("All");
  const [cardViewMode, setCardViewMode] = useState<"compact" | "expanded">("compact");
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set([13]));
  const [dailyDate, setDailyDate] = useState("2026-04-13");

  const filteredList = mockMemoryList.filter(
    (m) => memoryFilter === "All" || m.project === memoryFilter,
  );

  const groupedByDate = filteredList.reduce<Record<string, Memory[]>>((acc, m) => {
    const key = m.date.split(" ")[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b.replace(/\//g, "-")).getTime() - new Date(a.replace(/\//g, "-")).getTime(),
  );

  const byHour: Record<number, typeof mockDailyActivities> = {};
  mockDailyActivities
    .filter((a) => a.date === dailyDate)
    .forEach((a) => {
      const h = parseInt(a.time.split(":")[0]);
      if (!byHour[h]) byHour[h] = [];
      byHour[h].push(a);
    });

  const dailyDateObj = new Date(dailyDate);
  const dailyDateLabel = dailyDateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--luci-surface-bg)] pt-[60px] pl-10">
      <h1 className="text-[28px] font-bold tracking-[-0.02em] leading-[1.15] mb-7 pr-10 text-[var(--text-0)]">
        Memories
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--luci-border)] mb-5 pr-8">
        {(["meetings", "people", "library", "daily"] as MemoryTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setMemoryTab(tab)}
            className={`w-[72px] pb-2 text-sm border-b-2 mb-[-1px] transition-all text-center ${
              memoryTab === tab
                ? "border-[var(--luci-accent)] text-[var(--luci-accent)] font-semibold"
                : "border-transparent text-[var(--luci-text-muted)] hover:text-[var(--text-1)]"
            } ${tab === "daily" ? "opacity-10" : ""}`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Project tab */}
      {memoryTab === "meetings" && (
        <>
          <div className="flex items-center justify-between mb-5 pr-8">
            <select
              value={memoryFilter}
              onChange={(e) => setMemoryFilter(e.target.value)}
              className="appearance-none w-[120px] bg-[var(--luci-surface-bg)] border border-[var(--luci-border)] rounded-lg px-3 py-[6px] text-[13px] font-medium text-[var(--text-0)] cursor-pointer outline-none"
            >
              {ALL_PROJECTS.map((p) => (
                <option key={p} value={p}>
                  {p === "All" ? "All Projects" : p}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button className="flex items-center justify-center w-7 h-7 rounded-[7px] border border-[var(--luci-border)] bg-[var(--luci-surface-bg)] text-[var(--luci-text-tertiary)] cursor-pointer transition-colors hover:bg-[var(--luci-accent)] hover:text-black hover:border-[var(--luci-accent)]">
                <Plus size={13} />
              </button>
              <div className="flex bg-[var(--luci-surface-strong)] rounded-[7px] p-0.5 gap-0.5">
                {(["compact", "expanded"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCardViewMode(mode)}
                    className={`p-[4px_7px] flex items-center justify-center rounded-[5px] transition-all ${
                      cardViewMode === mode
                        ? "bg-[var(--luci-surface-bg)] text-[var(--text-0)] shadow-sm"
                        : "text-[var(--luci-text-muted)]"
                    }`}
                  >
                    {mode === "compact" ? <AlignJustify size={13} /> : <LayoutList size={13} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="flex flex-col pb-10 pr-8">
              {sortedDates.map((dateStr, dateIdx) => {
                const dateObj = new Date(dateStr.replace(/\//g, "-"));
                const day = dateObj.getDate();
                const month = dateObj.toLocaleString("en-US", { month: "short" });
                const items = groupedByDate[dateStr];
                return (
                  <div key={dateStr} className="flex items-start gap-4 pb-7">
                    <div className="flex-shrink-0 w-11 flex flex-col items-center pt-3.5 gap-0.5 self-stretch">
                      <span className="text-2xl font-bold leading-none text-[var(--text-0)]">{day}</span>
                      <span className="text-[11px] font-medium text-[var(--luci-text-tertiary)]">{month}</span>
                      {dateIdx < sortedDates.length - 1 && (
                        <div className="flex-1 w-[1.5px] min-h-7 mt-2 rounded-sm bg-[var(--luci-border)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                      {items.map((m, itemIdx) => {
                        const isExpanded = cardViewMode === "expanded" || expandedCards.has(m.id);
                        const maxAvatars = dateIdx === 0 && itemIdx === 0 ? 5 : 4;
                        return (
                          <div
                            key={m.id}
                            className="flex flex-col gap-2.5 rounded-[10px] bg-[var(--luci-surface-tile)] border border-[var(--luci-border)] shadow-[0_1px_4px_rgba(0,0,0,0.06)] cursor-pointer group transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)]"
                            style={{ padding: "14px 16px" }}
                            onClick={() =>
                              setExpandedCards((prev) => {
                                const next = new Set(prev);
                                if (next.has(m.id)) next.delete(m.id);
                                else next.add(m.id);
                                return next;
                              })
                            }
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex-1 min-w-0 text-sm font-semibold text-[var(--text-0)]">
                                {m.title}
                              </div>
                              <span className="flex-shrink-0 text-xs text-[var(--luci-text-tertiary)] group-hover:opacity-0 transition-opacity">
                                {m.date.split(" ")[1]?.slice(0, 5)}
                              </span>
                            </div>

                            {isExpanded ? (
                              <>
                                {m.summary && (
                                  <p className="text-[13px] leading-[1.6] text-[var(--luci-text-tertiary)] line-clamp-5">
                                    {m.summary}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 min-h-6 text-xs text-[var(--luci-text-tertiary)]">
                                  {m.participants.length > 0 && (
                                    <>
                                      <div className="flex items-center">
                                        {m.participants.slice(0, maxAvatars).map((p, idx) => (
                                          <img
                                            key={p.id}
                                            src={p.avatar}
                                            alt={p.name}
                                            title={p.name}
                                            className="w-6 h-6 rounded-full object-cover border border-[var(--luci-surface-bg)]"
                                            style={{ marginLeft: idx > 0 ? "-8px" : "0" }}
                                          />
                                        ))}
                                      </div>
                                      <span className="truncate">
                                        {m.participants.slice(0, 2).map((p) => p.name).join(", ")}
                                        {m.participants.length > 2 && ` +${m.participants.length - 2}`}
                                      </span>
                                    </>
                                  )}
                                  <a
                                    href={m.sourceUrl ?? "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-[var(--luci-surface-strong)] text-[var(--luci-text-tertiary)] text-[12px] font-medium no-underline hover:text-[var(--text-0)] transition-colors whitespace-nowrap"
                                    style={{
                                      opacity: m.sourceUrl ? 1 : 0.35,
                                      pointerEvents: m.sourceUrl ? "auto" : "none",
                                    }}
                                  >
                                    <span>{APP_SOURCE_ICON[m.appType]}</span>
                                    <span>{m.appType}</span>
                                    <ArrowUpRight size={11} />
                                  </a>
                                </div>
                              </>
                            ) : (
                              <p className="text-[13px] text-[var(--luci-text-muted)] leading-[1.6] truncate">
                                {m.summary ??
                                  `${m.title} — ${m.duration}. Discussion covered key points with ${m.participants[0]?.name ?? "the team"}.`}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </>
      )}

      {/* Daily tab */}
      {memoryTab === "daily" && (
        <div className="flex flex-col flex-1 gap-3 overflow-hidden">
          <div className="flex items-center gap-2.5 pr-8">
            <button
              className="flex items-center justify-center w-7 h-7 border-none bg-transparent rounded-md cursor-pointer text-[var(--luci-text-muted)] hover:bg-[var(--luci-surface-strong)] transition-colors"
              onClick={() => {
                const d = new Date(dailyDate);
                d.setDate(d.getDate() - 1);
                setDailyDate(d.toISOString().split("T")[0]);
              }}
            >
              <ArrowLeft size={14} />
            </button>
            <span className="text-sm font-semibold text-[var(--text-0)]">{dailyDateLabel}</span>
            <button
              className="flex items-center justify-center w-7 h-7 border-none bg-transparent rounded-md cursor-pointer text-[var(--luci-text-muted)] hover:bg-[var(--luci-surface-strong)] transition-colors"
              onClick={() => {
                const d = new Date(dailyDate);
                d.setDate(d.getDate() + 1);
                setDailyDate(d.toISOString().split("T")[0]);
              }}
            >
              <ArrowLeft size={14} style={{ transform: "rotate(180deg)" }} />
            </button>
          </div>
          <ScrollArea className="flex-1 min-h-0 pr-8">
            <div className="flex flex-col pb-10">
              {Array.from({ length: 24 }, (_, h) => {
                const activities = byHour[h] || [];
                const hasActivity = activities.length > 0;
                return (
                  <div key={h} className="flex gap-3 items-stretch h-14 flex-shrink-0">
                    <div className="flex gap-2 items-stretch flex-shrink-0 w-12">
                      <span className="text-[12px] font-semibold text-[var(--luci-text-muted)] w-5 text-right pt-0.5 flex-shrink-0">
                        {String(h).padStart(2, "0")}
                      </span>
                      <div className="flex flex-col items-center flex-1 h-full">
                        {h < 23 && (
                          <div
                            className="w-px flex-1"
                            style={{
                              background: `repeating-linear-gradient(to bottom, var(--luci-border) 0px, var(--luci-border) 6px, transparent 6px, transparent 10px)`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1 overflow-hidden py-1">
                      {hasActivity &&
                        activities.map((a) => (
                          <div
                            key={a.id}
                            className="bg-[var(--luci-surface-tile)] border border-[var(--luci-border)] rounded-lg px-3 py-1.5 flex flex-col gap-0.5 overflow-hidden flex-shrink-0"
                            style={{ height: `${Math.max(44, a.duration * 0.9)}px` }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base leading-none flex-shrink-0">{a.appIcon}</span>
                              <span className="text-sm font-semibold text-[var(--text-0)] flex-1 truncate">
                                {a.title}
                              </span>
                              <span className="text-xs text-[var(--luci-text-muted)] flex-shrink-0 whitespace-nowrap">
                                {a.time}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--luci-text-tertiary)] truncate">{a.summary}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* People / Library placeholder */}
      {(memoryTab === "people" || memoryTab === "library") && (
        <div className="flex-1 flex items-center justify-center text-sm text-[var(--luci-text-muted)]">
          Coming soon
        </div>
      )}
    </div>
  );
}
