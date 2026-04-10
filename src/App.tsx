import { useState, useRef, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
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
  Paperclip,
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
  SlidersHorizontal,
  X,
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
  cover: string; // gradient css value or image url
  thumbnail: string; // thumbnail image url
  participants: Array<{ id: number; avatar: string; name: string }>;
  project: string;
}

const mockMemoryList: Memory[] = [
  {
    id: 1,
    title: "Q1 Planning Meeting",
    date: "2025/03/15 14:03",
    duration: "1h 23m",
    cover: "linear-gradient(135deg,#e8f0fe,#c3d4f8)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project C",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=6", name: "Frank" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=7", name: "Grace" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=8", name: "Henry" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=9", name: "Iris" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=10", name: "Jack" },
      { id: 11, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=11", name: "Kate" },
      { id: 12, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=12", name: "Liam" },
    ]
  },
  {
    id: 2,
    title: "Design Review Sprint 4",
    date: "2025/03/15 15:30",
    duration: "45m",
    cover: "linear-gradient(135deg,#fde8f0,#f8c3d4)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project A",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=6", name: "Frank" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=7", name: "Grace" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=8", name: "Henry" },
    ]
  },
  {
    id: 3,
    title: "Engineering Sync",
    date: "2025/03/15 16:45",
    duration: "58m",
    cover: "linear-gradient(135deg,#e8fde8,#c3f8c3)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Untitled",
    participants: [
      { id: 2, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=6", name: "Frank" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=7", name: "Grace" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=8", name: "Henry" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=9", name: "Iris" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=10", name: "Jack" },
    ]
  },
  {
    id: 4,
    title: "Product Roadmap Review",
    date: "2025/03/14 14:30",
    duration: "1h 10m",
    cover: "linear-gradient(135deg,#fef8e8,#f8e8c3)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project B",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=1", name: "Alice" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=3", name: "Charlie" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5", name: "Eve" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=7", name: "Grace" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=9", name: "Iris" },
      { id: 11, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=11", name: "Kate" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=2", name: "Bob" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=4", name: "Diana" },
    ]
  },
  {
    id: 5,
    title: "Sales Kickoff",
    date: "2025/03/14 16:00",
    duration: "2h 05m",
    cover: "linear-gradient(135deg,#f0e8fe,#d4c3f8)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project A",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=6", name: "Frank" },
    ]
  },
  {
    id: 6,
    title: "Customer Onboarding",
    date: "2025/03/13 10:00",
    duration: "30m",
    cover: "linear-gradient(135deg,#e8fef8,#c3f8e8)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project C",
    participants: [
      { id: 3, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=6", name: "Frank" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=7", name: "Grace" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=8", name: "Henry" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=9", name: "Iris" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=10", name: "Jack" },
    ]
  },
  {
    id: 7,
    title: "Weekly Standup",
    date: "2025/03/13 11:30",
    duration: "20m",
    cover: "linear-gradient(135deg,#feeae8,#f8cdc3)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project B",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=6", name: "Frank" },
    ]
  },
  {
    id: 8,
    title: "UX Research Debrief",
    date: "2025/03/13 14:00",
    duration: "1h 02m",
    cover: "linear-gradient(135deg,#e8f8fe,#c3e8f8)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Untitled",
    participants: [
      { id: 2, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=2", name: "Bob" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=4", name: "Diana" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=6", name: "Frank" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=8", name: "Henry" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=10", name: "Jack" },
      { id: 12, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=12", name: "Liam" },
    ]
  },
  {
    id: 9,
    title: "Board Presentation Prep",
    date: "2025/03/07 14:00",
    duration: "1h 30m",
    cover: "linear-gradient(135deg,#fdf0e8,#f8d4c3)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project A",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=6", name: "Frank" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=7", name: "Grace" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=8", name: "Henry" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=9", name: "Iris" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=10", name: "Jack" },
    ]
  },
  {
    id: 10,
    title: "Marketing Strategy",
    date: "2025/03/06 10:30",
    duration: "55m",
    cover: "linear-gradient(135deg,#eefee8,#d4f8c3)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project C",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=1", name: "Alice" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=3", name: "Charlie" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5", name: "Eve" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=7", name: "Grace" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=9", name: "Iris" },
      { id: 11, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=11", name: "Kate" },
    ]
  },
  {
    id: 11,
    title: "Investor Update",
    date: "2025/03/05 15:30",
    duration: "40m",
    cover: "linear-gradient(135deg,#f8e8fe,#e8c3f8)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Untitled",
    participants: [
      { id: 2, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=2", name: "Bob" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=4", name: "Diana" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=6", name: "Frank" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=8", name: "Henry" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=10", name: "Jack" },
      { id: 12, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=12", name: "Liam" },
      { id: 1, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=1", name: "Alice" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=3", name: "Charlie" },
    ]
  },
  {
    id: 12,
    title: "Retrospective Sprint 3",
    date: "2025/03/04 17:00",
    duration: "1h 15m",
    cover: "linear-gradient(135deg,#e8fef5,#c3f8db)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project B",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=6", name: "Frank" },
    ]
  },
];

const allParticipantPool = [
  { id: 1,  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=1",  name: "Alice" },
  { id: 2,  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=2",  name: "Bob" },
  { id: 3,  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=3",  name: "Charlie" },
  { id: 4,  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=4",  name: "Diana" },
  { id: 5,  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=5",  name: "Eve" },
  { id: 6,  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=6",  name: "Frank" },
  { id: 7,  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=7",  name: "Grace" },
  { id: 8,  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=8",  name: "Henry" },
  { id: 9,  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=9",  name: "Iris" },
  { id: 10, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=10", name: "Jack" },
  { id: 11, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=11", name: "Kate" },
  { id: 12, avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=12", name: "Liam" },
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
  const [memoryTab, setMemoryTab] = useState<"meetings" | "people">("meetings");
  const [memoryFilter, setMemoryFilter] = useState("All");
  const [memoryFilters, setMemoryFilters] = useState(["All", "Project A", "Project B", "Project C", "Untitled"]);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [addProjectValue, setAddProjectValue] = useState("");
  const [editProjectsOpen, setEditProjectsOpen] = useState(false);
  const [editingProjectIdx, setEditingProjectIdx] = useState<number | null>(null);
  const [editingProjectValue, setEditingProjectValue] = useState("");
  const [editMeetingTarget, setEditMeetingTarget] = useState<Memory | null>(null);
  const [editMeetingProject, setEditMeetingProject] = useState("");
  const [editMeetingParticipants, setEditMeetingParticipants] = useState<Memory["participants"]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Receive transcribed voice text from island window → add to channel 1
  useEffect(() => {
    const unlisten = listen<string>("add-to-channel", (event) => {
      const text = event.payload.trim();
      if (!text) return;
      const ch = channelList[0];
      const newMsg: Message = {
        id: Date.now(),
        role: "user",
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setActiveNav("ask");
      setActiveChannel(ch);
      setMessages((prev) => {
        const base = prev.length ? prev : (mockMessages[ch.id] ?? []);
        return [...base, newMsg];
      });
    });
    return () => { unlisten.then((fn) => fn()); };
  }, [channelList]);

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

  function openEditMeeting(m: Memory) {
    setEditMeetingTarget(m);
    setEditMeetingProject(m.project);
    setEditMeetingParticipants([...m.participants]);
  }

  function confirmEditMeeting() {
    if (!editMeetingTarget) return;
    setMemoryList((prev) =>
      prev.map((m) =>
        m.id === editMeetingTarget.id
          ? { ...m, project: editMeetingProject, participants: editMeetingParticipants }
          : m
      )
    );
    setEditMeetingTarget(null);
  }

  function confirmEditProject(idx: number) {
    const name = editingProjectValue.trim();
    if (!name) return;
    const oldName = memoryFilters[idx];
    setMemoryFilters((prev) => prev.map((f, i) => i === idx ? name : f));
    setMemoryList((prev) => prev.map((m) => m.project === oldName ? { ...m, project: name } : m));
    if (memoryFilter === oldName) setMemoryFilter(name);
    setEditingProjectIdx(null);
  }

  function deleteProject(idx: number) {
    const name = memoryFilters[idx];
    // reassign cards belonging to this project to "Untitled"
    setMemoryList((prev) =>
      prev.map((m) => m.project === name ? { ...m, project: "Untitled" } : m)
    );
    // remove the project from filters, ensure "Untitled" stays
    setMemoryFilters((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (!next.includes("Untitled")) next.push("Untitled");
      return next;
    });
    if (memoryFilter === name) setMemoryFilter("All");
  }

  function confirmAddProject() {
    const name = addProjectValue.trim();
    if (!name) return;
    setMemoryFilters((prev) => [...prev, name]);
    setAddProjectOpen(false);
    setAddProjectValue("");
    setEditingProjectIdx(null);
  }

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
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
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
            <div className="memories-tabs">
              {(["meetings", "people"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`memory-tab ${memoryTab === tab ? "active" : ""}`}
                  onClick={() => setMemoryTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="memory-filters">
              {[...memoryFilters.filter((f) => f !== "Untitled"), "Untitled"].map((f) => (
                <button
                  key={f}
                  className={`memory-filter-btn ${memoryFilter === f ? "active" : ""}`}
                  onClick={() => setMemoryFilter(f)}
                >
                  {f}
                </button>
              ))}
              <div className="memory-filter-actions">
                <button className="memory-filter-add" onClick={() => setEditProjectsOpen(true)}>
                  <Pencil size={14} />
                </button>
              </div>
            </div>
            <div className="memories-list-container">
              {(() => {
                const filteredList = memoryFilter === "All" ? memoryList : memoryList.filter((m) => m.project === memoryFilter);
                const groupedByDate = filteredList.reduce((acc: Record<string, typeof filteredList>, m) => {
                  const dateStr = m.date.split(" ")[0];
                  if (!acc[dateStr]) acc[dateStr] = [];
                  acc[dateStr].push(m);
                  return acc;
                }, {});
                const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                return (
                  <div className="memories-rows">
                    {sortedDates.flatMap((dateStr, dateIdx) => {
                      const dateObj = new Date(dateStr);
                      const day = dateObj.getDate();
                      const month = dateObj.toLocaleString("en-US", { month: "short" });
                      const items = groupedByDate[dateStr];
                      const isLastDate = dateIdx === sortedDates.length - 1;
                      return items.map((m, itemIdx) => {
                        const isFirstItem = itemIdx === 0;
                        const isLastItem = itemIdx === items.length - 1;
                        const isVeryFirst = dateIdx === 0 && itemIdx === 0;
                        return (
                        <div key={m.id} className="memory-row">
                          <div className="memories-timeline-item">
                            {isFirstItem && (
                              <>
                                <div className="timeline-date">
                                  <div className="timeline-day">{day}</div>
                                  <div className="timeline-month">{month}</div>
                                </div>
                                <div className="timeline-dot"></div>
                              </>
                            )}
                            {!(isLastDate && isLastItem) && (
                              <div className="timeline-line"></div>
                            )}
                          </div>
                          <div className="memory-list-item">
                            <div className="memory-thumbnail">
                              <img src={m.thumbnail} alt={m.title} />
                            </div>
                            <div className="memory-content">
                              <div className="memory-title">{m.title}</div>
                              <div className="memory-meta">
                                <span className="memory-project">{m.project}</span>
                                <span className="memory-meta-divider" />
                                <span className="memory-datetime">{m.date}</span>
                              </div>
                              <div className="memory-participants">
                                <div className="participant-avatars">
                                  {m.participants.slice(0, isVeryFirst ? 6 : 3).map((p, idx) => (
                                    <img
                                      key={p.id}
                                      src={p.avatar}
                                      alt={p.name}
                                      className="participant-avatar"
                                      title={p.name}
                                      style={{ marginLeft: idx > 0 ? "-8px" : "0" }}
                                    />
                                  ))}
                                </div>
                                {isVeryFirst && m.participants.length > 6 && (
                                  <span className="participants-more">and {m.participants.length - 6} more</span>
                                )}
                              </div>
                            </div>
                            <div className="memory-actions">
                              <button
                                className="memory-action-btn"
                                onClick={(e) => { e.stopPropagation(); openEditMeeting(m); }}
                              >
                                <SlidersHorizontal size={14} />
                              </button>
                              <button
                                className="memory-action-btn danger"
                                onClick={(e) => { e.stopPropagation(); setDeleteMemoryTarget(m); }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        );
                      });
                    })}
                  </div>
                );
              })()}
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
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <div className="chat-input-box">
                {attachments.length > 0 && (
                  <div className="attachments-preview">
                    {attachments.map((f, i) => (
                      <div className="attachment-chip" key={i}>
                        <span className="attachment-name">{f.name}</span>
                        <button className="attachment-remove" onClick={() => removeAttachment(i)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <textarea
                  ref={textareaRef}
                  className="chat-input"
                  placeholder="Press Fn to ask"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className="chat-input-bottom">
                  <button className="attach-btn" onClick={() => fileInputRef.current?.click()}>
                    <Plus size={16} />
                  </button>
                  <button className={`send-btn ${input.trim() || attachments.length > 0 ? "active" : ""}`} onClick={sendMessage}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
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

      {editMeetingTarget && (
        <div className="modal-backdrop" onClick={() => setEditMeetingTarget(null)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Meeting</h2>
            <div className="modal-body">
              {/* Project selector */}
              <div className="em-section">
                <div className="em-label">Project</div>
                <div className="em-project-pills">
                  {memoryFilters.filter((f) => f !== "All").map((f) => (
                    <button
                      key={f}
                      className={`em-project-pill ${editMeetingProject === f ? "active" : ""}`}
                      onClick={() => setEditMeetingProject(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              {/* Participants */}
              <div className="em-section">
                <div className="em-label">Participants</div>
                <div className="em-participants">
                  {editMeetingParticipants.map((p) => (
                    <div key={p.id} className="em-participant-chip">
                      <img src={p.avatar} alt={p.name} className="em-participant-avatar" />
                      <span className="em-participant-name">{p.name}</span>
                      <button
                        className="em-participant-remove"
                        onClick={() => setEditMeetingParticipants((prev) => prev.filter((x) => x.id !== p.id))}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Add participants */}
              {allParticipantPool.filter((p) => !editMeetingParticipants.find((x) => x.id === p.id)).length > 0 && (
                <div className="em-section">
                  <div className="em-label">Add participants</div>
                  <div className="em-add-participants">
                    {allParticipantPool
                      .filter((p) => !editMeetingParticipants.find((x) => x.id === p.id))
                      .map((p) => (
                        <button
                          key={p.id}
                          className="em-add-participant"
                          onClick={() => setEditMeetingParticipants((prev) => [...prev, p])}
                          title={p.name}
                        >
                          <img src={p.avatar} alt={p.name} className="em-participant-avatar" />
                          <span className="em-participant-name">{p.name}</span>
                          <Plus size={11} className="em-add-icon" />
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setEditMeetingTarget(null)}>Cancel</button>
              <button className="modal-btn confirm" onClick={confirmEditMeeting}>Save</button>
            </div>
          </div>
        </div>
      )}

      {editProjectsOpen && (
        <div className="modal-backdrop" onClick={() => { setEditProjectsOpen(false); setEditingProjectIdx(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Projects</h2>
            <div className="modal-body">
              <div className="edit-projects-list">
                {memoryFilters.filter((f) => f !== "All").map((f) => {
                  const realIdx = memoryFilters.indexOf(f);
                  return (
                    <div key={f} className="edit-project-row">
                      {editingProjectIdx === realIdx ? (
                        <input
                          className="edit-project-input"
                          value={editingProjectValue}
                          onChange={(e) => setEditingProjectValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") confirmEditProject(realIdx); if (e.key === "Escape") setEditingProjectIdx(null); }}
                          onBlur={() => confirmEditProject(realIdx)}
                          autoFocus
                        />
                      ) : (
                        <span className="edit-project-name" onClick={() => { setEditingProjectIdx(realIdx); setEditingProjectValue(f); }}>{f}</span>
                      )}
                      {f !== "Untitled" && (
                        <button className="edit-project-delete" onClick={() => deleteProject(realIdx)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
                <div className="edit-project-add-row">
                  <input
                    className="edit-project-input"
                    placeholder="New project name..."
                    value={addProjectValue}
                    onChange={(e) => setAddProjectValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") confirmAddProject(); }}
                  />
                  <button className="edit-project-add-btn" onClick={confirmAddProject}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn confirm" onClick={() => { setEditProjectsOpen(false); setEditingProjectIdx(null); }}>Done</button>
            </div>
          </div>
        </div>
      )}

      <Modal
        title="New project"
        open={addProjectOpen}
        onConfirm={confirmAddProject}
        onCancel={() => setAddProjectOpen(false)}
        confirmLabel="Add"
      >
        <input
          className="modal-input"
          placeholder="Project name"
          value={addProjectValue}
          onChange={(e) => setAddProjectValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && confirmAddProject()}
          autoFocus
        />
      </Modal>

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
