import { useState, useRef, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import logoUrl from "./assets/logo.svg";
import Modal from "./components/Modal";
import ChannelItem from "./components/ChannelItem";
import {
  MessageCircle,
  BookMarked,
  Settings,
  Layers,
  TrendingUp,
  Plus,
  ArrowLeft,
  Send,
  PanelLeftClose,
  PanelLeftOpen,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronDown,
  Check,
  Key,
  Download,
} from "lucide-react";
import "./App.css";

interface Channel {
  id: number;
  name: string;
  desc: string;
  time: string;
}

interface Message {
  id: number;
  role: "user" | "agent";
  text: string;
  time: string;
}

interface Memory {
  id: number;
  title: string;
  date: string;
  duration: string;
  cover: string; // gradient css value
}

const mockMemoryList: Memory[] = [
  { id: 1,  title: "Q1 Planning Meeting",       date: "Mar 15, 2026 · 9:00 AM",  duration: "1h 23m", cover: "linear-gradient(135deg,#e8f0fe,#c3d4f8)" },
  { id: 2,  title: "Design Review Sprint 4",     date: "Mar 14, 2026 · 2:30 PM",  duration: "45m",    cover: "linear-gradient(135deg,#fde8f0,#f8c3d4)" },
  { id: 3,  title: "Engineering Sync",           date: "Mar 13, 2026 · 10:00 AM", duration: "58m",    cover: "linear-gradient(135deg,#e8fde8,#c3f8c3)" },
  { id: 4,  title: "Product Roadmap Review",     date: "Mar 12, 2026 · 3:00 PM",  duration: "1h 10m", cover: "linear-gradient(135deg,#fef8e8,#f8e8c3)" },
  { id: 5,  title: "Sales Kickoff",              date: "Mar 11, 2026 · 9:30 AM",  duration: "2h 05m", cover: "linear-gradient(135deg,#f0e8fe,#d4c3f8)" },
  { id: 6,  title: "Customer Onboarding",        date: "Mar 10, 2026 · 11:00 AM", duration: "30m",    cover: "linear-gradient(135deg,#e8fef8,#c3f8e8)" },
  { id: 7,  title: "Weekly Standup",             date: "Mar 9,  2026 · 9:00 AM",  duration: "20m",    cover: "linear-gradient(135deg,#feeae8,#f8cdc3)" },
  { id: 8,  title: "UX Research Debrief",        date: "Mar 8,  2026 · 4:00 PM",  duration: "1h 02m", cover: "linear-gradient(135deg,#e8f8fe,#c3e8f8)" },
  { id: 9,  title: "Board Presentation Prep",    date: "Mar 7,  2026 · 2:00 PM",  duration: "1h 30m", cover: "linear-gradient(135deg,#fdf0e8,#f8d4c3)" },
  { id: 10, title: "Marketing Strategy",         date: "Mar 6,  2026 · 10:30 AM", duration: "55m",    cover: "linear-gradient(135deg,#eefee8,#d4f8c3)" },
  { id: 11, title: "Investor Update",            date: "Mar 5,  2026 · 3:30 PM",  duration: "40m",    cover: "linear-gradient(135deg,#f8e8fe,#e8c3f8)" },
  { id: 12, title: "Retrospective Sprint 3",     date: "Mar 4,  2026 · 5:00 PM",  duration: "1h 15m", cover: "linear-gradient(135deg,#e8fef5,#c3f8db)" },
];

const channels: Channel[] = [
  { id: 1, name: "General", desc: "Refined Figma designs based on new constraints", time: "5:45 pm" },
  { id: 2, name: "PM", desc: "promptpromptpromptpromptpromptprompt", time: "5:45 pm" },
  { id: 3, name: "Sales", desc: "Refined Figma designs based on new constraints", time: "5:45 pm" },
  { id: 4, name: "CRM", desc: "Refined Figma designs based on new constraints", time: "5:45 pm" },
];

const mockMessages: Record<number, Message[]> = {
  1: [
    { id: 1, role: "agent", text: "Hi! I'm LUCI. How can I help you with General today?", time: "5:30 pm" },
    { id: 2, role: "user", text: "Can you help me refine the Figma designs?", time: "5:31 pm" },
    { id: 3, role: "agent", text: "Of course! I've reviewed your designs and have some suggestions based on the new constraints. The main areas to focus on are spacing, typography hierarchy, and component consistency.", time: "5:32 pm" },
    { id: 4, role: "user", text: "Great, let's start with spacing.", time: "5:33 pm" },
    { id: 5, role: "agent", text: "For spacing, I recommend using an 8pt grid system. Your current designs use inconsistent spacing — some sections use 12px, others 16px. Aligning everything to multiples of 8 will make it feel more polished.", time: "5:34 pm" },
  ],
  2: [
    { id: 1, role: "agent", text: "PM channel ready. What's on the agenda?", time: "5:40 pm" },
    { id: 2, role: "user", text: "promptpromptpromptpromptpromptprompt", time: "5:41 pm" },
  ],
  3: [{ id: 1, role: "agent", text: "Sales channel here. How can I assist?", time: "5:43 pm" }],
  4: [{ id: 1, role: "agent", text: "CRM channel ready.", time: "5:44 pm" }],
};

type NavItem = "ask" | "memories" | "settings";

const skillList = [
  { id: "skill-creator",   name: "Skill Creator",       desc: "Create new reusable skills and best practices for your agent." },
  { id: "web-search",      name: "Web Search",           desc: "Search the web in real time to find up-to-date information." },
  { id: "code-review",     name: "Code Review",          desc: "Automatically review pull requests and suggest improvements." },
  { id: "meeting-summary", name: "Meeting Summary",      desc: "Summarize meeting recordings and extract action items." },
  { id: "email-draft",     name: "Email Drafting",       desc: "Draft professional emails based on context and intent." },
  { id: "data-analysis",   name: "Data Analysis",        desc: "Analyze spreadsheets and generate insights from data." },
  { id: "image-gen",       name: "Image Generation",     desc: "Generate images from text descriptions using AI models." },
  { id: "crm-sync",        name: "CRM Sync",             desc: "Sync conversation data and action items to your CRM automatically." },
];

const integrationList = [
  { id: "slack",       name: "Slack",            color: "#4A154B", bg: "#F4EDF4" },
  { id: "notion",      name: "Notion",            color: "#1a1a1a", bg: "#F0F0F0" },
  { id: "gcal",        name: "Google Calendar",   color: "#4285F4", bg: "#EBF2FF" },
  { id: "github",      name: "GitHub",            color: "#1a1a1a", bg: "#F0F0F0" },
  { id: "zoom",        name: "Zoom",              color: "#2D8CFF", bg: "#EBF3FF" },
  { id: "gmail",       name: "Gmail",             color: "#EA4335", bg: "#FEECEB" },
  { id: "linear",      name: "Linear",            color: "#5E6AD2", bg: "#EEEFFE" },
  { id: "jira",        name: "Jira",              color: "#0052CC", bg: "#E6EFFE" },
  { id: "figma",       name: "Figma",             color: "#F24E1E", bg: "#FEECE8" },
  { id: "salesforce",  name: "Salesforce",        color: "#00A1E0", bg: "#E6F6FC" },
  { id: "hubspot",     name: "HubSpot",           color: "#FF7A59", bg: "#FFF0EC" },
  { id: "asana",       name: "Asana",             color: "#FC636B", bg: "#FFECEC" },
];

function handleDragStart(e: React.MouseEvent) {
  if (e.button !== 0) return;
  getCurrentWindow().startDragging();
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState<NavItem>("ask");
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [channelList, setChannelList] = useState<Channel[]>(channels);
  const [renameTarget, setRenameTarget] = useState<Channel | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Channel | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createValue, setCreateValue] = useState("");

  const [settingsTab, setSettingsTab] = useState("account");
  const [skillMenuId, setSkillMenuId] = useState<string | null>(null);
  const [enabledSkills, setEnabledSkills] = useState<Set<string>>(new Set(["web-search", "meeting-summary"]));
  function toggleSkill(id: string) {
    setEnabledSkills((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const [connectedApps, setConnectedApps] = useState<Set<string>>(new Set());
  function toggleConnect(id: string) {
    setConnectedApps((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  const [themeMode, setThemeMode] = useState("system");
  const restorePoints = ["20260317143012", "20260316090512", "20260315164823"];
  const [restorePoint, setRestorePoint] = useState(restorePoints[0]);
  const [restoreDropdownOpen, setRestoreDropdownOpen] = useState(false);

  const [memoryList, setMemoryList] = useState<Memory[]>(mockMemoryList);
  const [memoryMenuId, setMemoryMenuId] = useState<number | null>(null);
  const [renameMemoryTarget, setRenameMemoryTarget] = useState<Memory | null>(null);
  const [renameMemoryValue, setRenameMemoryValue] = useState("");
  const [deleteMemoryTarget, setDeleteMemoryTarget] = useState<Memory | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (skillMenuId === null) return;
    function handleClick() { setSkillMenuId(null); }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [skillMenuId]);

  useEffect(() => {
    if (!restoreDropdownOpen) return;
    function handleClick() { setRestoreDropdownOpen(false); }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [restoreDropdownOpen]);

  useEffect(() => {
    if (memoryMenuId === null) return;
    function handleClick() { setMemoryMenuId(null); }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [memoryMenuId]);

  function confirmRenameMemory() {
    if (!renameMemoryTarget || !renameMemoryValue.trim()) return;
    setMemoryList((prev) =>
      prev.map((m) => m.id === renameMemoryTarget.id ? { ...m, title: renameMemoryValue.trim() } : m)
    );
    setRenameMemoryTarget(null);
  }

  function confirmDeleteMemory() {
    if (!deleteMemoryTarget) return;
    setMemoryList((prev) => prev.filter((m) => m.id !== deleteMemoryTarget.id));
    setDeleteMemoryTarget(null);
  }

  function openChannel(ch: Channel) {
    setActiveChannel(ch);
    setMessages(mockMessages[ch.id] ?? []);
  }

  function closeChannel() {
    setActiveChannel(null);
    setMessages([]);
  }

  function sendMessage() {
    const text = input.trim();
    if (!text || !activeChannel) return;
    const newMsg: Message = {
      id: Date.now(),
      role: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "agent",
          text: "Got it! Let me work on that for you...",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 800);
  }

  function confirmRename() {
    if (!renameTarget || !renameValue.trim()) return;
    setChannelList((prev) =>
      prev.map((ch) => ch.id === renameTarget.id ? { ...ch, name: renameValue.trim() } : ch)
    );
    setRenameTarget(null);
  }

  function cancelRename() {
    setRenameTarget(null);
  }

  function confirmCreate() {
    const name = createValue.trim();
    if (!name) return;
    setChannelList((prev) => [
      ...prev,
      { id: Date.now(), name, desc: "", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setCreateOpen(false);
    setCreateValue("");
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setChannelList((prev) => prev.filter((ch) => ch.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="app">
      {/* ── Full-width drag strip (always on top, below toggle) ── */}
      <div className="app-titlebar" onMouseDown={handleDragStart} />

      {/* ── Open button (only when sidebar is closed) ── */}
      {!sidebarOpen && (
        <button className="sidebar-open-btn" onClick={() => setSidebarOpen(true)}>
          <PanelLeftOpen size={16} />
        </button>
      )}

      {/* ── Floating Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        {/* drag region + space for traffic lights, close btn at top-right */}
        <div className="sidebar-header" onMouseDown={handleDragStart}>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <PanelLeftClose size={16} />
          </button>
        </div>

        <div className="sidebar-brand">
          <img src={logoUrl} alt="LUCI" className="sidebar-logo-img" />
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeNav === "ask" ? "active" : ""}`} onClick={() => setActiveNav("ask")}>
            <MessageCircle size={16} />
            <span>Ask LUCI</span>
            <kbd className="shortcut">Fn</kbd>
          </button>
          <button className={`nav-item ${activeNav === "memories" ? "active" : ""}`} onClick={() => setActiveNav("memories")}>
            <BookMarked size={16} />
            <span>Memories</span>
          </button>
          <button className={`nav-item ${activeNav === "settings" ? "active" : ""}`} onClick={() => setActiveNav("settings")}>
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="avatar" />
          <div className="user-info">
            <span className="user-name">Username</span>
            <span className="user-plan">Free Plan</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={`main ${sidebarOpen ? "with-sidebar" : "centered"}`}>
        {/* drag region for window when sidebar is closed */}
        <div className="main-drag" onMouseDown={handleDragStart} />
        {activeNav === "memories" && !activeChannel ? (
          <div className="memories-view">
            <h1 className="memories-title">Memories</h1>
            <div className="memories-grid">
              {memoryList.map((m) => (
                <div className="memory-card" key={m.id}>
                  <div className="memory-cover" style={{ background: m.cover }}>
                    <button
                      className="memory-more-btn"
                      onClick={(e) => { e.stopPropagation(); setMemoryMenuId(memoryMenuId === m.id ? null : m.id); }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {memoryMenuId === m.id && (
                      <div className="memory-dropdown" onClick={(e) => e.stopPropagation()}>
                        <button className="memory-dropdown-item" onClick={() => { setRenameMemoryTarget(m); setRenameMemoryValue(m.title); setMemoryMenuId(null); }}>
                          <Pencil size={13} />
                          Rename
                        </button>
                        <button className="memory-dropdown-item danger" onClick={() => { setDeleteMemoryTarget(m); setMemoryMenuId(null); }}>
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="memory-info">
                    <span className="memory-name">{m.title}</span>
                    <span className="memory-date">{m.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeNav === "settings" && !activeChannel ? (
          <div className="settings-view">
            <h1 className="settings-title">Settings</h1>
            <div className="settings-tabs">
              {[
                { id: "account",      label: "Account" },
                { id: "integrations", label: "Integrations" },
                { id: "skills",       label: "Skills" },
                { id: "subscription", label: "Subscription" },
                { id: "recording",    label: "Recording Preference" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`settings-tab ${settingsTab === tab.id ? "active" : ""}`}
                  onClick={() => setSettingsTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {settingsTab === "account" && (
              <div className="account-content">
                {/* Row 1: Avatar + Username */}
                <div className="account-row">
                  <div className="account-avatar" />
                  <span className="account-username">Username</span>
                </div>

                <div className="settings-divider" />

                {/* Row 2: Theme */}
                <div className="account-row">
                  <span className="account-row-label">Theme</span>
                  <div className="theme-selector">
                    {[
                      { id: "system", label: "System Mode" },
                      { id: "light",  label: "Light Mode" },
                      { id: "dark",   label: "Dark Mode" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        className={`theme-btn ${themeMode === t.id ? "active" : ""}`}
                        onClick={() => setThemeMode(t.id)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-divider" />

                {/* Row 3: Luci's computer */}
                <div className="account-row">
                  <div className="account-row-text">
                    <span className="account-row-label">Luci's computer</span>
                    <span className="account-row-sub">A secure virtual environment where Luci runs</span>
                  </div>
                  <div className="account-row-actions">
                    <button className="settings-btn">Restart</button>
                    <button className="settings-btn">Manual backup</button>
                    <div className="restore-split-btn">
                      <button className="restore-main">Restore</button>
                      <div className="restore-divider" />
                      <div className="restore-arrow-wrap" onClick={(e) => { e.stopPropagation(); setRestoreDropdownOpen((v) => !v); }}>
                        <ChevronDown size={13} />
                        {restoreDropdownOpen && (
                          <div className="restore-dropdown" onClick={(e) => e.stopPropagation()}>
                            {restorePoints.map((p) => (
                              <button
                                key={p}
                                className="restore-dropdown-item"
                                onClick={() => { setRestorePoint(p); setRestoreDropdownOpen(false); }}
                              >
                                <span className="restore-check">{restorePoint === p ? <Check size={12} /> : null}</span>
                                {p}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="settings-divider" />

                {/* Row 4: Import memory */}
                <div className="account-row">
                  <span className="account-row-label">Import memory to LUCI</span>
                  <div className="account-row-actions">
                    <button className="settings-btn">Import</button>
                  </div>
                </div>

                <div className="settings-divider" />

                {/* Row 5: Telegram */}
                <div className="account-row">
                  <span className="account-row-label">Chat with Luci on Telegram</span>
                  <div className="account-row-actions">
                    <button className="settings-btn">Start on Telegram</button>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === "subscription" && (
              <div className="subscription-content">
                <div className="subscription-header">
                  <div className="subscription-plan-text">
                    <span className="subscription-plan-name">Free Plan</span>
                    <span className="subscription-plan-ends">Ends on 9999/01/01</span>
                  </div>
                  <button className="subscription-upgrade-btn">Upgrade</button>
                </div>

                <div className="settings-divider" />

                <p className="subscription-desc">
                  The Free Plan gives you access to core LUCI features including up to 5 channels, basic AI assistance, and 1 GB of memory storage. Upgrade to unlock unlimited channels, advanced skills, priority support, and full access to Luci's computer environment.
                </p>

                <div className="settings-divider" />

                <div className="subscription-usage-row">
                  <span className="account-row-label">Usage</span>
                  <div className="subscription-usage-right">
                    <div className="usage-bar">
                      <div className="usage-bar-fill" style={{ width: "12%" }} />
                    </div>
                    <span className="usage-label">12% used</span>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === "skills" && (
              <div className="skills-content">
                <h2 className="skills-section-title">Skills</h2>
                <p className="skills-section-desc">
                  Pre-built, reusable best practices and tools for your agent.{" "}
                  Skills triggered using "/" (e.g., /skill-creator). Turn on the toggle to let LUCI run them automatically.
                </p>
                <div className="skills-list">
                  {skillList.map((skill) => (
                    <div className="skill-item" key={skill.id}>
                      <div className="skill-text">
                        <span className="skill-name">{skill.name}</span>
                        <span className="skill-desc">{skill.desc}</span>
                      </div>
                      <div className="skill-actions">
                        <button
                          className={`skill-toggle ${enabledSkills.has(skill.id) ? "on" : ""}`}
                          onClick={() => toggleSkill(skill.id)}
                          aria-label="Toggle skill"
                        >
                          <span className="skill-toggle-thumb" />
                        </button>
                        <div className="skill-more-wrap">
                          <button
                            className="skill-more-btn"
                            onClick={(e) => { e.stopPropagation(); setSkillMenuId(skillMenuId === skill.id ? null : skill.id); }}
                          >
                            <MoreVertical size={15} />
                          </button>
                          {skillMenuId === skill.id && (
                            <div className="skill-dropdown" onClick={(e) => e.stopPropagation()}>
                              <button className="skill-dropdown-item">
                                <Key size={13} />
                                API key manage
                              </button>
                              <button className="skill-dropdown-item">
                                <Download size={13} />
                                Download skill
                              </button>
                              <button className="skill-dropdown-item danger">
                                <Trash2 size={13} />
                                Delete skill
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {settingsTab === "integrations" && (
              <div className="integrations-content">
                <div className="integrations-grid">
                  {integrationList.map((app) => {
                    const connected = connectedApps.has(app.id);
                    return (
                      <div className="integration-card" key={app.id}>
                        <div className="integration-logo" style={{ background: app.bg, color: app.color }}>
                          {app.name.charAt(0)}
                        </div>
                        <span className="integration-name">{app.name}</span>
                        <button
                          className={`integration-btn ${connected ? "connected" : ""}`}
                          onClick={() => toggleConnect(app.id)}
                        >
                          {connected ? "Connected" : "Connect"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : activeChannel ? (
          <div className="chat-view">
            <div className="chat-header">
              <button className="back-btn" onClick={closeChannel}>
                <ArrowLeft size={18} />
              </button>
              <div className="chat-header-info">
                <div className="channel-icon-small">#</div>
                <span className="chat-title">{activeChannel.name}</span>
              </div>
            </div>

            <div className="message-list">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.role}`}>
                  <div className="bubble-wrap">
                    <div className={`bubble ${msg.role}`}>{msg.text}</div>
                    <span className="msg-time">{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <textarea
                className="chat-input"
                placeholder="Message LUCI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button className={`send-btn ${input.trim() ? "active" : ""}`} onClick={sendMessage}>
                <Send size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="home-view">
            <div className="main-header">
              <h1 className="greeting">Hello, Shawn</h1>
              <div className="stats-badge">
                <div className="stat">
                  <Layers size={15} />
                  <span>999 Tasks</span>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                  <TrendingUp size={15} />
                  <span>120% Productivity</span>
                </div>
              </div>
            </div>

            <div className="channels">
              <div className="channels-header">
                <span className="channels-title">Channels</span>
                <button className="add-btn" onClick={() => { setCreateOpen(true); setCreateValue(""); }}>
                  <Plus size={16} />
                </button>
              </div>
              <div className="channel-list">
                {channelList.map((ch) => (
                  <ChannelItem
                    key={ch.id}
                    channel={ch}
                    onClick={openChannel}
                    onRename={(ch) => { setRenameTarget(ch); setRenameValue(ch.name); }}
                    onDelete={(ch) => setDeleteTarget(ch)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      {/* ── Rename Modal ── */}
      <Modal
        title="Create channel"
        open={createOpen}
        onConfirm={confirmCreate}
        onCancel={() => setCreateOpen(false)}
        confirmLabel="Create"
      >
        <input
          className="modal-input"
          placeholder="Channel name"
          value={createValue}
          onChange={(e) => setCreateValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && confirmCreate()}
          autoFocus
        />
      </Modal>

      <Modal
        title="Rename channel"
        open={!!renameTarget}
        onConfirm={confirmRename}
        onCancel={cancelRename}
      >
        <input
          className="modal-input"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && confirmRename()}
          autoFocus
        />
      </Modal>

      <Modal
        title="Delete the channel?"
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete"
        confirmDanger
      />

      <Modal
        title="Rename recording"
        open={!!renameMemoryTarget}
        onConfirm={confirmRenameMemory}
        onCancel={() => setRenameMemoryTarget(null)}
      >
        <input
          className="modal-input"
          value={renameMemoryValue}
          onChange={(e) => setRenameMemoryValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && confirmRenameMemory()}
          autoFocus
        />
      </Modal>

      <Modal
        title="Delete this recording?"
        open={!!deleteMemoryTarget}
        onConfirm={confirmDeleteMemory}
        onCancel={() => setDeleteMemoryTarget(null)}
        confirmLabel="Delete"
        confirmDanger
      />
    </div>
  );
}
