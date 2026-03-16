import { useState, useRef, useEffect } from "react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      {/* ── Fixed toggle button (always visible) ── */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen((v) => !v)}
        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </button>

      {/* ── Floating Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        {/* drag region + space for traffic lights */}
        <div className="sidebar-header" data-tauri-drag-region />

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
        <div className="main-drag" data-tauri-drag-region />
        {activeChannel ? (
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
    </div>
  );
}
