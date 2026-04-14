import { useState, useRef, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import logoUrl from "./assets/logo.svg";
import Modal from "./components/Modal";
import RegularButton from "./components/RegularButton";
import MenuBarTab from "./components/MenuBarTab";
import RegularIconButton from "./components/RegularIconButton";
import Title from "./components/Title";
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
  Folder,
  UserPlus,
  UsersRound,
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
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=7", name: "Grace" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8", name: "Henry" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=9", name: "Iris" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=10", name: "Jack" },
      { id: 11, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=11", name: "Kate" },
      { id: 12, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=12", name: "Liam" },
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
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=7", name: "Grace" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8", name: "Henry" },
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
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=7", name: "Grace" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8", name: "Henry" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=9", name: "Iris" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=10", name: "Jack" },
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
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=7", name: "Grace" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=9", name: "Iris" },
      { id: 11, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=11", name: "Kate" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
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
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
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
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=7", name: "Grace" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8", name: "Henry" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=9", name: "Iris" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=10", name: "Jack" },
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
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
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
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8", name: "Henry" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=10", name: "Jack" },
      { id: 12, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=12", name: "Liam" },
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
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=7", name: "Grace" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8", name: "Henry" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=9", name: "Iris" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=10", name: "Jack" },
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
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=7", name: "Grace" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=9", name: "Iris" },
      { id: 11, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=11", name: "Kate" },
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
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8", name: "Henry" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=10", name: "Jack" },
      { id: 12, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=12", name: "Liam" },
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
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
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
    ]
  },
  {
    id: 13,
    title: "Feature Kickoff — Notification System",
    date: "2026/04/08 10:00",
    duration: "50m",
    cover: "linear-gradient(135deg,#fde8f0,#f8c3d4)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project A",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
    ]
  },
  {
    id: 14,
    title: "API Design Review",
    date: "2026/04/09 14:30",
    duration: "1h 05m",
    cover: "linear-gradient(135deg,#f0e8fe,#d4c3f8)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project A",
    participants: [
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8", name: "Henry" },
    ]
  },
  {
    id: 15,
    title: "Sprint Planning — Q2",
    date: "2026/04/10 09:30",
    duration: "1h 20m",
    cover: "linear-gradient(135deg,#e8fde8,#c3f8c3)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project A",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
    ]
  },
  {
    id: 16,
    title: "Frontend Architecture Discussion",
    date: "2026/04/11 15:00",
    duration: "45m",
    cover: "linear-gradient(135deg,#e8f0fe,#c3d4f8)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project A",
    participants: [
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
      { id: 9, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=9", name: "Iris" },
    ]
  },
  {
    id: 17,
    title: "Bug Triage — Release 2.1",
    date: "2026/04/09 11:00",
    duration: "35m",
    cover: "linear-gradient(135deg,#fef8e8,#f8e8c3)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project B",
    participants: [
      { id: 3, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", name: "Charlie" },
      { id: 5, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", name: "Eve" },
      { id: 7, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=7", name: "Grace" },
      { id: 11, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=11", name: "Kate" },
    ]
  },
  {
    id: 18,
    title: "Stakeholder Demo — Beta Build",
    date: "2026/04/11 16:00",
    duration: "1h 10m",
    cover: "linear-gradient(135deg,#feeae8,#f8cdc3)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project B",
    participants: [
      { id: 1, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", name: "Alice" },
      { id: 2, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", name: "Bob" },
      { id: 4, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", name: "Diana" },
      { id: 6, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", name: "Frank" },
      { id: 8, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8", name: "Henry" },
      { id: 10, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=10", name: "Jack" },
    ]
  },
];

const mockDailyActivities = [
  // Apr 13
  { id: 101, date: "2026-04-13", time: "09:05", duration: 18, app: "Mail", appIcon: "✉️", title: "Checked morning emails", summary: "Reviewed 14 emails, replied to 6 including client feedback and team standup notes." },
  { id: 102, date: "2026-04-13", time: "09:48", duration: 35, app: "Notion", appIcon: "📝", title: "Weekly planning session", summary: "Set priorities for the week, created 9 tasks across 3 projects and updated the roadmap board." },
  { id: 103, date: "2026-04-13", time: "10:30", duration: 75, app: "Figma", appIcon: "🎨", title: "Iterated on dashboard layout", summary: "Explored 4 layout variations for the analytics dashboard and aligned components to the 8px grid." },
  { id: 104, date: "2026-04-13", time: "11:15", duration: 22, app: "Slack", appIcon: "💬", title: "Synced with design team", summary: "Discussed typography decisions and agreed on a shared type scale for the design system." },
  { id: 105, date: "2026-04-13", time: "13:20", duration: 45, app: "VS Code", appIcon: "💻", title: "Refactored state management", summary: "Extracted 3 custom hooks and reduced component re-renders by consolidating related state." },
  { id: 106, date: "2026-04-13", time: "14:10", duration: 28, app: "Chrome", appIcon: "🌐", title: "Researched animation libraries", summary: "Compared Framer Motion, GSAP and CSS transitions across 11 pages, took notes on performance tradeoffs." },
  { id: 107, date: "2026-04-13", time: "15:00", duration: 60, app: "Zoom", appIcon: "📹", title: "Sprint planning meeting", summary: "Estimated 12 story points with the team and broke down 5 epics into actionable tickets for the week." },
  { id: 108, date: "2026-04-13", time: "16:05", duration: 80, app: "Figma", appIcon: "🎨", title: "Updated component library", summary: "Added dark mode variants to 8 components and documented usage guidelines in the design system." },
  { id: 109, date: "2026-04-13", time: "17:30", duration: 25, app: "Notion", appIcon: "📝", title: "Wrote sprint retrospective", summary: "Documented 5 wins and 3 blockers from last sprint, proposed 2 process improvements for the team." },
  // Apr 12
  { id: 201, date: "2026-04-12", time: "09:10", duration: 12, app: "Slack", appIcon: "💬", title: "Morning standup catchup", summary: "Read through overnight messages, flagged 2 urgent items and added comments on the design thread." },
  { id: 202, date: "2026-04-12", time: "10:00", duration: 90, app: "VS Code", appIcon: "💻", title: "Built timeline component", summary: "Implemented the 24-hour fixed timeline with scroll-to-9am default and responsive card layout." },
  { id: 203, date: "2026-04-12", time: "11:20", duration: 38, app: "Chrome", appIcon: "🌐", title: "Debugged CSS layout issue", summary: "Traced a flex overflow bug across 7 Stack Overflow threads and resolved it with min-height: 0." },
  { id: 204, date: "2026-04-12", time: "12:05", duration: 55, app: "Figma", appIcon: "🎨", title: "Designed empty states", summary: "Created illustrations and copy for 6 empty state screens covering first-run and no-data scenarios." },
  { id: 205, date: "2026-04-12", time: "14:00", duration: 45, app: "Zoom", appIcon: "📹", title: "Design feedback session", summary: "Received critique from 3 stakeholders, captured 11 revision notes and prioritized by impact." },
  { id: 206, date: "2026-04-12", time: "15:10", duration: 50, app: "VS Code", appIcon: "💻", title: "Wrote unit tests", summary: "Added 14 test cases for the merge and filter logic, achieving 87% coverage on the utilities module." },
  { id: 207, date: "2026-04-12", time: "16:00", duration: 30, app: "Notion", appIcon: "📝", title: "Updated technical docs", summary: "Documented 4 new API endpoints and revised the authentication flow diagram with the latest changes." },
  { id: 208, date: "2026-04-12", time: "17:00", duration: 20, app: "Slack", appIcon: "💬", title: "EOD team wrap-up", summary: "Shared daily progress summary, reviewed 3 PRs and left approvals for the front-end refactor branch." },
  // Apr 11
  { id: 1,   date: "2026-04-11", time: "09:14", duration: 42, app: "Figma", appIcon: "🎨", title: "Edited design components", summary: "Spent 42 minutes refining button styles and updating the color system in the main design file." },
  { id: 2,   date: "2026-04-11", time: "10:02", duration: 85, app: "VS Code", appIcon: "💻", title: "Worked on frontend code", summary: "Made 37 edits across 5 files, primarily fixing layout issues in the memories view component." },
  { id: 3,   date: "2026-04-11", time: "11:30", duration: 15, app: "Slack", appIcon: "💬", title: "Team communication", summary: "Exchanged 24 messages in 3 channels, discussed sprint priorities and reviewed PR feedback." },
  { id: 4,   date: "2026-04-11", time: "13:00", duration: 60, app: "Notion", appIcon: "📝", title: "Wrote product spec", summary: "Drafted the feature spec for the Library tab including project cards, people grid and merge flows." },
  { id: 5,   date: "2026-04-11", time: "14:15", duration: 35, app: "Chrome", appIcon: "🌐", title: "Research & browsing", summary: "Visited 18 pages across MDN, Stack Overflow, and GitHub to research CSS grid layout solutions." },
  { id: 6,   date: "2026-04-11", time: "15:40", duration: 25, app: "Notion", appIcon: "📝", title: "Updated project notes", summary: "Wrote meeting recap and updated task list with 6 new action items from the afternoon sync." },
  { id: 7,   date: "2026-04-11", time: "16:30", duration: 55, app: "Figma", appIcon: "🎨", title: "Polished mobile layouts", summary: "Adjusted spacing and typography on 12 screens to meet the 375px breakpoint requirements." },
  { id: 8,   date: "2026-04-11", time: "17:45", duration: 20, app: "VS Code", appIcon: "💻", title: "Merged feature branch", summary: "Resolved 3 merge conflicts, ran the test suite and successfully merged the library-tab branch." },
  // Apr 10
  { id: 301, date: "2026-04-10", time: "09:00", duration: 20, app: "Mail", appIcon: "✉️", title: "Processed inbox", summary: "Archived 22 emails, replied to 8 and forwarded 3 design assets to the client team." },
  { id: 302, date: "2026-04-10", time: "09:50", duration: 65, app: "Figma", appIcon: "🎨", title: "Designed new onboarding flow", summary: "Created 8 new screens for the onboarding sequence, iterating on user feedback from last week's test." },
  { id: 303, date: "2026-04-10", time: "11:00", duration: 18, app: "Slack", appIcon: "💬", title: "Discussed release timeline", summary: "Aligned with PM on v1.2 scope, agreed to cut 2 features and push them to the next cycle." },
  { id: 304, date: "2026-04-10", time: "12:05", duration: 40, app: "Chrome", appIcon: "🌐", title: "Reviewed competitor apps", summary: "Analysed 5 competing products for their timeline and activity feed patterns, saved 8 screenshots." },
  { id: 305, date: "2026-04-10", time: "13:05", duration: 75, app: "VS Code", appIcon: "💻", title: "Backend API integration", summary: "Implemented 3 new API endpoints and wrote unit tests covering edge cases for authentication flow." },
  { id: 306, date: "2026-04-10", time: "14:30", duration: 30, app: "Notion", appIcon: "📝", title: "Documented API contracts", summary: "Wrote request and response schemas for 5 endpoints and added example payloads to the dev wiki." },
  { id: 307, date: "2026-04-10", time: "15:45", duration: 45, app: "Figma", appIcon: "🎨", title: "Created icon set", summary: "Drew 16 custom icons at 20×20 and exported optimised SVGs for the navigation and action buttons." },
  { id: 308, date: "2026-04-10", time: "16:30", duration: 45, app: "Zoom", appIcon: "📹", title: "Client presentation call", summary: "Presented design mockups to the client for 45 minutes, received positive feedback with minor revision requests." },
  { id: 309, date: "2026-04-10", time: "17:20", duration: 22, app: "VS Code", appIcon: "💻", title: "Fixed post-meeting bugs", summary: "Patched 4 issues flagged during the client call including a date formatting bug and a scroll glitch." },
  // Apr 9
  { id: 401, date: "2026-04-09", time: "09:00", duration: 45, app: "Chrome", appIcon: "🌐", title: "Morning research session", summary: "Read 5 articles on AI product design trends and bookmarked 12 references for the upcoming project." },
  { id: 402, date: "2026-04-09", time: "09:55", duration: 28, app: "Notion", appIcon: "📝", title: "Outlined weekly goals", summary: "Listed 7 deliverables for the week and linked each to the corresponding project milestone." },
  { id: 403, date: "2026-04-09", time: "10:40", duration: 55, app: "Figma", appIcon: "🎨", title: "Worked on color tokens", summary: "Defined 48 semantic color tokens for light and dark themes and synced them to the component library." },
  { id: 404, date: "2026-04-09", time: "11:45", duration: 30, app: "Slack", appIcon: "💬", title: "Design review discussion", summary: "Participated in a 30-minute async design review thread, leaving 8 comments on shared mockups." },
  { id: 405, date: "2026-04-09", time: "13:30", duration: 40, app: "VS Code", appIcon: "💻", title: "Set up project scaffold", summary: "Initialised the Tauri + React + Vite project, configured TypeScript strict mode and added ESLint rules." },
  { id: 406, date: "2026-04-09", time: "14:20", duration: 60, app: "Chrome", appIcon: "🌐", title: "Read Tauri documentation", summary: "Studied the Tauri v2 plugin system and window management APIs across 9 documentation pages." },
  { id: 407, date: "2026-04-09", time: "15:05", duration: 70, app: "VS Code", appIcon: "💻", title: "Built sidebar navigation", summary: "Implemented the collapsible sidebar with icon nav and channel list, wired up active state transitions." },
  { id: 408, date: "2026-04-09", time: "16:15", duration: 35, app: "Figma", appIcon: "🎨", title: "Reviewed design with team", summary: "Screen-shared the latest Figma file, collected feedback from 4 teammates and tagged 11 revision items." },
  { id: 409, date: "2026-04-09", time: "17:10", duration: 18, app: "Notion", appIcon: "📝", title: "End-of-day summary", summary: "Logged completed tasks, updated the project status to In Progress and set tomorrow's top 3 priorities." },
];

const mockActivityTypes = [
  { label: "Coding", value: 35, color: "#e8621a" },
  { label: "Communication", value: 25, color: "#f28c4e" },
  { label: "Design", value: 20, color: "#f7b07e" },
  { label: "Research", value: 15, color: "#fad0aa" },
  { label: "Other", value: 5, color: "#fdeedd" },
];

const mockHourlyUsage = [
  { hour: 0, minutes: 0 }, { hour: 1, minutes: 0 }, { hour: 2, minutes: 0 },
  { hour: 3, minutes: 0 }, { hour: 4, minutes: 0 }, { hour: 5, minutes: 5 },
  { hour: 6, minutes: 8 }, { hour: 7, minutes: 15 }, { hour: 8, minutes: 32 },
  { hour: 9, minutes: 52 }, { hour: 10, minutes: 48 }, { hour: 11, minutes: 55 },
  { hour: 12, minutes: 20 }, { hour: 13, minutes: 18 }, { hour: 14, minutes: 50 },
  { hour: 15, minutes: 58 }, { hour: 16, minutes: 45 }, { hour: 17, minutes: 42 },
  { hour: 18, minutes: 25 }, { hour: 19, minutes: 32 }, { hour: 20, minutes: 28 },
  { hour: 21, minutes: 20 }, { hour: 22, minutes: 12 }, { hour: 23, minutes: 5 },
];

const mockPersonalTodos = [
  { id: 1, text: "Review design feedback from team", done: false },
  { id: 2, text: "Update project documentation", done: true },
  { id: 3, text: "Schedule weekly sync meeting", done: false },
  { id: 4, text: "Fix navigation animation bug", done: false },
];

const mockPersonalDone = [
  { id: 101, text: "You spent 75 minutes refining the dashboard layout — 4 layout variations explored, all snapped to the 8px grid." },
  { id: 102, text: "A focused 55-minute Notion session wrapped up the week's priorities with 9 tasks organized across 3 projects." },
  { id: 103, text: "You shipped the sidebar navigation today — collapsible, icon-driven, with smooth active state transitions." },
  { id: 104, text: "Back-to-back deep work blocks from 14:00–17:00 — your longest focus streak this week." },
  { id: 105, text: "Wrapped the day with a clear end-of-day summary and tomorrow's top 3 priorities already set." },
];

const mockPeople = [
  { id: 1,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1",  name: "Alice",   email: "alice@company.com" },
  { id: 2,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2",  name: "Bob",     email: "bob@company.com" },
  { id: 3,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3",  name: "Charlie", email: "charlie@company.com" },
  { id: 4,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4",  name: "Diana",   email: "diana@company.com" },
  { id: 5,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5",  name: "Eve",     email: "eve@company.com" },
  { id: 6,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6",  name: "Frank",   email: "frank@company.com" },
  { id: 7,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=7",  name: "Grace",   email: "grace@company.com" },
  { id: 8,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8",  name: "Henry",   email: "henry@company.com" },
  { id: 9,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=9",  name: "Iris",    email: "iris@company.com" },
  { id: 10, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=10", name: "Jack",    email: "jack@company.com" },
  { id: 11, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=11", name: "Kate",    email: "kate@company.com" },
  { id: 12, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=12", name: "Liam",    email: "liam@company.com" },
];

const allParticipantPool = [
  { id: 1,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1",  name: "Alice" },
  { id: 2,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2",  name: "Bob" },
  { id: 3,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3",  name: "Charlie" },
  { id: 4,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4",  name: "Diana" },
  { id: 5,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5",  name: "Eve" },
  { id: 6,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6",  name: "Frank" },
  { id: 7,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=7",  name: "Grace" },
  { id: 8,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8",  name: "Henry" },
  { id: 9,  avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=9",  name: "Iris" },
  { id: 10, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=10", name: "Jack" },
  { id: 11, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=11", name: "Kate" },
  { id: 12, avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=12", name: "Liam" },
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

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (themeMode === "light") {
      root.removeAttribute("data-theme");
    } else {
      // system
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const apply = (e: MediaQueryListEvent | MediaQueryList) =>
        e.matches ? root.setAttribute("data-theme", "dark") : root.removeAttribute("data-theme");
      apply(mq);
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [themeMode]);

  const restorePoints = ["20260317143012", "20260316090512", "20260315164823"];
  const [restorePoint, setRestorePoint] = useState(restorePoints[0]);
  const [restoreDropdownOpen, setRestoreDropdownOpen] = useState(false);

  const [memoryList, setMemoryList] = useState<Memory[]>(mockMemoryList);
  const [memoryMenuId, setMemoryMenuId] = useState<number | null>(null);
  const [renameMemoryTarget, setRenameMemoryTarget] = useState<Memory | null>(null);
  const [renameMemoryValue, setRenameMemoryValue] = useState("");
  const [deleteMemoryTarget, setDeleteMemoryTarget] = useState<Memory | null>(null);
  const [memoryTab, setMemoryTab] = useState<"daily" | "meetings" | "people" | "library" | "personal">("personal");
  const [dailyDate, setDailyDate] = useState("2026-04-11");
  const dailyScrollRef = useRef<HTMLDivElement>(null);
  const [people, setPeople] = useState(mockPeople);
  const [memoryFilters, setMemoryFilters] = useState(["All", "Project A", "Project B", "Project C", "Untitled"]);
  const [memoryFilter, setMemoryFilter] = useState(() => memoryFilters.find((f) => f !== "All" && f !== "Untitled") ?? "Untitled");
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [addProjectValue, setAddProjectValue] = useState("");
  const [editProjectsOpen, setEditProjectsOpen] = useState(false);
  const [editingProjectIdx, setEditingProjectIdx] = useState<number | null>(null);
  const [editingProjectValue, setEditingProjectValue] = useState("");
  const [renameProjectOpen, setRenameProjectOpen] = useState(false);
  const [editPersonTarget, setEditPersonTarget] = useState<{ id: number; name: string; email: string } | null>(null);
  const [deletePersonTarget, setDeletePersonTarget] = useState<{ id: number; name: string } | null>(null);
  const [createPersonOpen, setCreatePersonOpen] = useState(false);
  const [createPersonName, setCreatePersonName] = useState("");
  const [createPersonEmail, setCreatePersonEmail] = useState("");
  const [mergePeopleOpen, setMergePeopleOpen] = useState(false);
  const [mergePeopleSelected, setMergePeopleSelected] = useState<number[]>([]);
  const [mergePeopleStep, setMergePeopleStep] = useState<"select" | "rename">("select");
  const [mergePeopleNewName, setMergePeopleNewName] = useState("");
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createProjectValue, setCreateProjectValue] = useState("");
  const [deleteProjectTarget, setDeleteProjectTarget] = useState<{ idx: number; name: string } | null>(null);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeSelected, setMergeSelected] = useState<string[]>([]);
  const [mergeStep, setMergeStep] = useState<"select" | "rename">("select");
  const [mergeNewName, setMergeNewName] = useState("");
  const [personFilter, setPersonFilter] = useState<number>(mockPeople[0].id);
  const [personalTodos, setPersonalTodos] = useState<{ id: number; text: string; done: boolean }[]>(mockPersonalTodos);
  const [personalDone, setPersonalDone] = useState<{ id: number; text: string }[]>(mockPersonalDone);
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

  useEffect(() => {
    if (dailyScrollRef.current) {
      // each hour row is 56px, scroll to hour 9
      dailyScrollRef.current.scrollTop = 9 * 56;
    }
  }, [dailyDate, memoryTab]);

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

  function createPerson() {
    const name = createPersonName.trim();
    if (!name) return;
    const newId = Math.max(...people.map((p) => p.id)) + 1;
    setPeople((prev) => [...prev, {
      id: newId,
      avatar: `https://api.dicebear.com/9.x/lorelei/svg?seed=${newId}`,
      name,
      email: createPersonEmail.trim(),
    }]);
    setCreatePersonOpen(false);
    setCreatePersonName("");
    setCreatePersonEmail("");
  }

  function confirmMergePeople() {
    const name = mergePeopleNewName.trim();
    if (!name || mergePeopleSelected.length < 2) return;
    const primary = people.find((p) => p.id === mergePeopleSelected[0])!;
    const mergedPerson = { ...primary, name };
    setPeople((prev) => [
      ...prev.filter((p) => !mergePeopleSelected.includes(p.id)),
      mergedPerson,
    ]);
    setMemoryList((prev) => prev.map((m) => ({
      ...m,
      participants: m.participants.some((p) => mergePeopleSelected.includes(Number(p.id)))
        ? [
            ...m.participants.filter((p) => !mergePeopleSelected.includes(Number(p.id))),
            { id: mergedPerson.id, avatar: mergedPerson.avatar, name: mergedPerson.name },
          ]
        : m.participants,
    })));
    setMergePeopleOpen(false);
    setMergePeopleSelected([]);
    setMergePeopleStep("select");
    setMergePeopleNewName("");
  }

  function confirmMerge() {
    const name = mergeNewName.trim();
    if (!name || mergeSelected.length < 2) return;
    setMemoryList((prev) =>
      prev.map((m) => mergeSelected.includes(m.project) ? { ...m, project: name } : m)
    );
    setMemoryFilters((prev) => {
      const without = prev.filter((f) => !mergeSelected.includes(f));
      if (without.includes(name)) return without;
      const untitledIdx = without.indexOf("Untitled");
      return untitledIdx >= 0
        ? [...without.slice(0, untitledIdx), name, ...without.slice(untitledIdx)]
        : [...without, name];
    });
    if (mergeSelected.includes(memoryFilter)) setMemoryFilter(name);
    setMergeMode(false);
    setMergeSelected([]);
    setMergeStep("select");
    setMergeNewName("");
    setEditProjectsOpen(false);
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
          <MenuBarTab icon={<MessageCircle size={16} />} label="Ask LUCI" active={activeNav === "ask"} onClick={() => setActiveNav("ask")} />
          <MenuBarTab icon={<BookMarked size={16} />} label="Memories" active={activeNav === "memories"} onClick={() => setActiveNav("memories")} />
          <MenuBarTab icon={<Settings size={16} />} label="Settings" active={activeNav === "settings"} onClick={() => setActiveNav("settings")} />
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
              {(["personal", "meetings", "people", "library", "daily"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`memory-tab ${memoryTab === tab ? "active" : ""}`}
                  style={tab === "daily" ? { opacity: 0.1 } : undefined}
                  onClick={() => { setMemoryTab(tab); }}
                >
                  {tab === "daily" ? "Daily" : tab === "meetings" ? "Project" : tab === "people" ? "People" : tab === "personal" ? "Personal" : "Library"}
                </button>
              ))}
            </div>
            {(memoryTab === "meetings" || memoryTab === "people") && <>
            {memoryTab === "meetings" && <div className="memory-filters">
              {[...memoryFilters.filter((f) => f !== "Untitled" && f !== "All"), "Untitled"].map((f) => (
                <button
                  key={f}
                  className={`memory-filter-btn ${memoryFilter === f ? "active" : ""}`}
                  onClick={() => setMemoryFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>}
            <>
            {memoryTab === "people" && (() => {
              const person = people.find((p) => p.id === personFilter);
              return person ? (
                <div className="memory-filters">
                  <div className="person-filter-chip">
                    <img src={person.avatar} alt={person.name} className="person-filter-avatar" />
                    <div className="person-filter-select-wrap">
                      <select
                        className="person-filter-select"
                        value={personFilter}
                        onChange={(e) => setPersonFilter(Number(e.target.value))}
                      >
                        {people.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={11} className="person-filter-chevron" />
                    </div>
                  </div>
                  {[...memoryFilters.filter((f) => f !== "Untitled"), "Untitled"].map((f) => (
                    <button
                      key={f}
                      className={`memory-filter-btn ${memoryFilter === f ? "active" : ""}`}
                      onClick={() => setMemoryFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
            <div className="memories-list-container">
              {(() => {
                const filteredList = memoryList
                  .filter((m) => memoryFilter === "All" || m.project === memoryFilter)
                  .filter((m) => memoryTab !== "people" || m.participants.some((p) => Number(p.id) === Number(personFilter)));
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
            </>
            </>}
            {memoryTab === "personal" && (
              <div className="personal-view">
                <div className="personal-row personal-row2">
                  <div className="personal-card personal-todo-card">
                    <div className="personal-card-title">Todo</div>
                    <div className="personal-list">
                      {personalTodos.map((item) => (
                        <div key={item.id} className="personal-list-item" onClick={() => setPersonalTodos((prev) => prev.map((t) => t.id === item.id ? { ...t, done: !t.done } : t))}>
                          {item.done
                            ? <span className="personal-check-done"><Check size={10} /></span>
                            : <span className="personal-check-empty" />}
                          <span className={`personal-list-text${item.done ? " done" : ""}`}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="personal-card personal-done-card">
                    <div className="personal-card-title">Highlights</div>
                    <div className="personal-highlight-list">
                      {personalDone.map((item) => (
                        <div key={item.id} className="personal-highlight-item">
                          <span className="personal-highlight-text">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="personal-row">
                  <div className="personal-card personal-pie-card">
                    <div className="personal-card-title">Activity Types</div>
                    <div className="personal-pie-content">
                      <svg viewBox="-30 -20 260 240" className="personal-pie-svg" overflow="visible">
                        {(() => {
                          let offset = 0;
                          const r = 60, cx = 100, cy = 100, circ = 2 * Math.PI * r;
                          return mockActivityTypes.map((item) => {
                            const dash = (item.value / 100) * circ;
                            const startAngle = (offset / 100) * 360 - 90;
                            const midAngleDeg = startAngle + (item.value / 100) * 180;
                            const midRad = (midAngleDeg * Math.PI) / 180;
                            offset += item.value;
                            const lineR1 = 75, lineR2 = 90, horizLen = 14;
                            const lx1 = cx + lineR1 * Math.cos(midRad);
                            const ly1 = cy + lineR1 * Math.sin(midRad);
                            const lx2 = cx + lineR2 * Math.cos(midRad);
                            const ly2 = cy + lineR2 * Math.sin(midRad);
                            const isRight = Math.cos(midRad) >= 0;
                            const lx3 = lx2 + (isRight ? horizLen : -horizLen);
                            return (
                              <g key={item.label}>
                                <circle
                                  cx={cx} cy={cy} r={r}
                                  fill="none"
                                  stroke={item.color}
                                  strokeWidth={26}
                                  strokeDasharray={`${dash} ${circ - dash}`}
                                  transform={`rotate(${startAngle} ${cx} ${cy})`}
                                />
                                {item.value >= 8 && (
                                  <>
                                    <polyline
                                      points={`${lx1},${ly1} ${lx2},${ly2} ${lx3},${ly2}`}
                                      fill="none"
                                      stroke="#ccc"
                                      strokeWidth={1}
                                    />
                                    <text
                                      x={lx3 + (isRight ? 3 : -3)}
                                      y={ly2 - 7}
                                      fontSize={11}
                                      fill="#333"
                                      fontWeight="500"
                                      textAnchor={isRight ? "start" : "end"}
                                      dominantBaseline="middle"
                                    >{item.label}</text>
                                    <text
                                      x={lx3 + (isRight ? 3 : -3)}
                                      y={ly2 + 7}
                                      fontSize={10}
                                      fill="#999"
                                      textAnchor={isRight ? "start" : "end"}
                                      dominantBaseline="middle"
                                    >{item.value}%</text>
                                  </>
                                )}
                              </g>
                            );
                          });
                        })()}
                        {(() => {
                          const totalMins = mockHourlyUsage.reduce((s, h) => s + h.minutes, 0);
                          const h = Math.floor(totalMins / 60);
                          const m = totalMins % 60;
                          return (
                            <>
                              <text x={100} y={93} fontSize={10} fill="#aaa" textAnchor="middle" dominantBaseline="middle">Total</text>
                              <text x={100} y={109} fontSize={14} fontWeight="600" fill="#1a1a1a" textAnchor="middle" dominantBaseline="middle">{h}h {m}min</text>
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>
                  <div className="personal-card personal-bar-card">
                    <div className="personal-card-title">Hourly App Usage</div>
                    <div className="personal-bar-chart">
                      <div className="personal-bar-area">
                        {mockHourlyUsage.map((item) => (
                          <div key={item.hour} className="personal-bar-slot">
                            <div className="personal-bar-fill" style={{ height: `${(item.minutes / 60) * 100}%`, background: item.minutes >= 50 ? "#e8621a" : item.minutes >= 35 ? "#f28c4e" : item.minutes >= 20 ? "#f7b07e" : item.minutes >= 8 ? "#fad0aa" : "#fdeedd" }} />
                          </div>
                        ))}
                      </div>
                      <div className="personal-bar-x-axis">
                        {[0, 6, 12, 18, 23].map((h) => (
                          <span key={h} style={{ left: `${(h / 23) * 100}%` }}>{String(h).padStart(2, "0")}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {memoryTab === "daily" && (() => {
              const byHour: Record<number, typeof mockDailyActivities> = {};
              mockDailyActivities
                .filter((a) => a.date === dailyDate)
                .forEach((a) => {
                  const h = parseInt(a.time.split(":")[0]);
                  if (!byHour[h]) byHour[h] = [];
                  byHour[h].push(a);
                });
              const dateObj = new Date(dailyDate);
              const dateLabel = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
              return (
                <div className="daily-view">
                  <div className="daily-date-nav">
                    <button className="daily-nav-btn" onClick={() => { const d = new Date(dailyDate); d.setDate(d.getDate() - 1); setDailyDate(d.toISOString().split("T")[0]); }}><ArrowLeft size={14} /></button>
                    <span className="daily-date-label">{dateLabel}</span>
                    <button className="daily-nav-btn" onClick={() => { const d = new Date(dailyDate); d.setDate(d.getDate() + 1); setDailyDate(d.toISOString().split("T")[0]); }}><ArrowLeft size={14} style={{ transform: "rotate(180deg)" }} /></button>
                  </div>
                  <div className="daily-timeline" ref={dailyScrollRef}>
                    {Array.from({ length: 24 }, (_, h) => {
                      const activities = byHour[h] || [];
                      const hasActivity = activities.length > 0;
                      const isLast = h === 23;
                      return (
                        <div key={h} className={`daily-hour-row ${hasActivity ? "active" : "empty"}`}>
                          <div className="daily-hour-left">
                            <span className="daily-hour-label">{String(h).padStart(2, "0")}</span>
                            <div className="daily-hour-track">
                              {hasActivity && <div className="daily-hour-dot" />}
                              {!isLast && <div className="daily-hour-line" />}
                            </div>
                          </div>
                          <div className="daily-hour-right">
                            {activities.map((a) => (
                              <div key={a.id} className="daily-card" style={{ height: `${Math.max(44, a.duration * 0.9)}px` }}>
                                <div className="daily-card-header">
                                  <span className="daily-app-icon">{a.appIcon}</span>
                                  <span className="daily-card-title">{a.title}</span>
                                  <span className="daily-card-time">{a.time}</span>
                                </div>
                                <div className="daily-card-summary">{a.summary}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            {memoryTab === "library" && (
              <div className="library-view">
                <div className="library-section">
                  <div className="library-section-header">
                    <h2 className="library-section-title">Project</h2>
                    <div className="library-section-actions">
                      <button className="library-section-btn" onClick={() => { setCreateProjectValue(""); setCreateProjectOpen(true); }}><Plus size={12} />Create</button>
                      <button className="library-section-btn" onClick={() => { setEditProjectsOpen(true); setMergeMode(true); }}><Layers size={12} />Merge</button>
                    </div>
                  </div>
                  <div className="project-cards-list">
                    {memoryFilters.filter((f) => f !== "All" && f !== "Untitled").map((f) => {
                      const idx = memoryFilters.indexOf(f);
                      return (
                        <div key={f} className="project-card">
                          <Folder size={18} className="project-card-icon" />
                          <span className="project-card-name">{f}</span>
                          <div className="project-card-actions">
                            <button className="project-card-action-btn" onClick={(e) => { e.stopPropagation(); setEditingProjectIdx(idx); setEditingProjectValue(f); setRenameProjectOpen(true); }}>
                              <Pencil size={13} />
                            </button>
                            {f !== "Untitled" && (
                              <button className="project-card-action-btn danger" onClick={(e) => { e.stopPropagation(); setDeleteProjectTarget({ idx, name: f }); }}>
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="library-section">
                  <div className="library-section-header">
                    <h2 className="library-section-title">People</h2>
                    <div className="library-section-actions">
                      <button className="library-section-btn" onClick={() => { setCreatePersonName(""); setCreatePersonEmail(""); setCreatePersonOpen(true); }}><UserPlus size={12} />Create</button>
                      <button className="library-section-btn" onClick={() => { setMergePeopleSelected([]); setMergePeopleStep("select"); setMergePeopleNewName(""); setMergePeopleOpen(true); }}><UsersRound size={12} />Merge</button>
                    </div>
                  </div>
                  <div className="people-grid library-people-grid">
                    {people.map((p) => (
                      <div key={p.id} className="people-card library-people-card">
                        <img src={p.avatar} alt={p.name} className="people-avatar" />
                        <div className="people-info">
                          <span className="people-name">{p.name}</span>
                          <span className="people-email">{p.email}</span>
                        </div>
                        <div className="people-card-actions">
                          <button className="project-card-action-btn" onClick={(e) => { e.stopPropagation(); setEditPersonTarget({ id: p.id, name: p.name, email: p.email }); }}>
                            <Pencil size={13} />
                          </button>
                          <button className="project-card-action-btn danger" onClick={(e) => { e.stopPropagation(); setDeletePersonTarget({ id: p.id, name: p.name }); }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
                    <RegularButton>Restart</RegularButton>
                    <RegularButton>Manual backup</RegularButton>
                    <div className="restore-split-btn">
                      <RegularButton>Restore</RegularButton>
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
                    <RegularButton>Import</RegularButton>
                  </div>
                </div>

                <div className="settings-divider" />

                {/* Row 5: Telegram */}
                <div className="account-row">
                  <span className="account-row-label">Chat with Luci on Telegram</span>
                  <div className="account-row-actions">
                    <RegularButton>Start on Telegram</RegularButton>
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
                  <RegularButton variant="primary">Upgrade</RegularButton>
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
                        <RegularButton
                          onClick={() => toggleConnect(app.id)}
                        >
                          {connected ? "Connected" : "Connect"}
                        </RegularButton>
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
              <Title rightBtn={<RegularIconButton icon={<Plus size={16} />} variant="outlined" onClick={() => { setCreateOpen(true); setCreateValue(""); }} />}>Sessions</Title>
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

      {deletePersonTarget && (
        <div className="modal-backdrop" onClick={() => setDeletePersonTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Delete Contact</h2>
            <div className="modal-body">
              <p className="modal-desc">Are you sure you want to delete <strong>{deletePersonTarget.name}</strong>?</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setDeletePersonTarget(null)}>Cancel</button>
              <button className="modal-btn confirm danger" onClick={() => { setPeople((prev) => prev.filter((x) => x.id !== deletePersonTarget.id)); setDeletePersonTarget(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {editPersonTarget && (
        <div className="modal-backdrop" onClick={() => setEditPersonTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Contact</h2>
            <div className="modal-body">
              <input
                className="modal-input"
                placeholder="Name"
                value={editPersonTarget.name}
                onChange={(e) => setEditPersonTarget((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                autoFocus
              />
              <input
                className="modal-input"
                placeholder="Email"
                value={editPersonTarget.email}
                onChange={(e) => setEditPersonTarget((prev) => prev ? { ...prev, email: e.target.value } : prev)}
                style={{ marginTop: 8 }}
              />
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setEditPersonTarget(null)}>Cancel</button>
              <button className="modal-btn confirm" disabled={!editPersonTarget.name.trim()} onClick={() => {
                setPeople((prev) => prev.map((p) => p.id === editPersonTarget.id ? { ...p, name: editPersonTarget.name.trim(), email: editPersonTarget.email.trim() } : p));
                setEditPersonTarget(null);
              }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {createPersonOpen && (
        <div className="modal-backdrop" onClick={() => setCreatePersonOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">New Contact</h2>
            <div className="modal-body">
              <input
                className="modal-input"
                placeholder="Name"
                value={createPersonName}
                onChange={(e) => setCreatePersonName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createPerson(); if (e.key === "Escape") setCreatePersonOpen(false); }}
                autoFocus
              />
              <input
                className="modal-input"
                placeholder="Email (optional)"
                value={createPersonEmail}
                onChange={(e) => setCreatePersonEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createPerson(); if (e.key === "Escape") setCreatePersonOpen(false); }}
                style={{ marginTop: 8 }}
              />
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setCreatePersonOpen(false)}>Cancel</button>
              <button className="modal-btn confirm" disabled={!createPersonName.trim()} onClick={createPerson}>Create</button>
            </div>
          </div>
        </div>
      )}

      {mergePeopleOpen && (
        <div className="modal-backdrop" onClick={() => setMergePeopleOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Merge Contacts</h2>
            <div className="modal-body">
              {mergePeopleStep === "rename" ? (
                <div className="merge-rename-step">
                  <p className="merge-rename-label">Merging {mergePeopleSelected.length} contacts into one. Enter a name:</p>
                  <input
                    className="modal-input"
                    placeholder="Merged contact name..."
                    value={mergePeopleNewName}
                    onChange={(e) => setMergePeopleNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") confirmMergePeople(); if (e.key === "Escape") setMergePeopleStep("select"); }}
                    autoFocus
                  />
                  <div className="merge-selected-tags" style={{ marginTop: 8 }}>
                    {mergePeopleSelected.map((id) => {
                      const p = people.find((x) => x.id === id);
                      return p ? <span key={id} className="merge-tag">{p.name}</span> : null;
                    })}
                  </div>
                </div>
              ) : (
                <div className="merge-people-list">
                  {people.map((p) => (
                    <label key={p.id} className="merge-person-row">
                      <input
                        type="checkbox"
                        className="merge-checkbox"
                        checked={mergePeopleSelected.includes(p.id)}
                        onChange={(e) => setMergePeopleSelected((prev) => e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id))}
                      />
                      <img src={p.avatar} alt={p.name} className="merge-person-avatar" />
                      <span className="merge-person-name">{p.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-actions">
              {mergePeopleStep === "rename" ? (
                <>
                  <button className="modal-btn cancel" onClick={() => { setMergePeopleStep("select"); setMergePeopleNewName(""); }}>Back</button>
                  <button className="modal-btn confirm" disabled={!mergePeopleNewName.trim()} onClick={confirmMergePeople}>Merge</button>
                </>
              ) : (
                <>
                  <button className="modal-btn cancel" onClick={() => setMergePeopleOpen(false)}>Cancel</button>
                  <button className="modal-btn confirm" disabled={mergePeopleSelected.length < 2} onClick={() => setMergePeopleStep("rename")}>
                    Next {mergePeopleSelected.length > 0 ? `(${mergePeopleSelected.length})` : ""}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {createProjectOpen && (
        <div className="modal-backdrop" onClick={() => setCreateProjectOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">New Project</h2>
            <div className="modal-body">
              <input
                className="modal-input"
                placeholder="Project name..."
                value={createProjectValue}
                onChange={(e) => setCreateProjectValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && createProjectValue.trim()) {
                    setMemoryFilters((prev) => {
                      const idx = prev.indexOf("Untitled");
                      return idx >= 0 ? [...prev.slice(0, idx), createProjectValue.trim(), ...prev.slice(idx)] : [...prev, createProjectValue.trim()];
                    });
                    setCreateProjectOpen(false);
                  }
                  if (e.key === "Escape") setCreateProjectOpen(false);
                }}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setCreateProjectOpen(false)}>Cancel</button>
              <button className="modal-btn confirm" disabled={!createProjectValue.trim()} onClick={() => {
                setMemoryFilters((prev) => {
                  const idx = prev.indexOf("Untitled");
                  return idx >= 0 ? [...prev.slice(0, idx), createProjectValue.trim(), ...prev.slice(idx)] : [...prev, createProjectValue.trim()];
                });
                setCreateProjectOpen(false);
              }}>Create</button>
            </div>
          </div>
        </div>
      )}

      {deleteProjectTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteProjectTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Delete Project</h2>
            <div className="modal-body">
              <p className="modal-desc">Are you sure you want to delete <strong>{deleteProjectTarget.name}</strong>? Memories in this project will be moved to Untitled.</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setDeleteProjectTarget(null)}>Cancel</button>
              <button className="modal-btn confirm danger" onClick={() => { deleteProject(deleteProjectTarget.idx); setDeleteProjectTarget(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {renameProjectOpen && editingProjectIdx !== null && (
        <div className="modal-backdrop" onClick={() => { setRenameProjectOpen(false); setEditingProjectIdx(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Rename Project</h2>
            <div className="modal-body">
              <input
                className="modal-input"
                value={editingProjectValue}
                onChange={(e) => setEditingProjectValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { confirmEditProject(editingProjectIdx); setRenameProjectOpen(false); } if (e.key === "Escape") { setRenameProjectOpen(false); setEditingProjectIdx(null); } }}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => { setRenameProjectOpen(false); setEditingProjectIdx(null); }}>Cancel</button>
              <button className="modal-btn confirm" onClick={() => { confirmEditProject(editingProjectIdx); setRenameProjectOpen(false); }} disabled={!editingProjectValue.trim()}>Rename</button>
            </div>
          </div>
        </div>
      )}

      {editProjectsOpen && (
        <div className="modal-backdrop" onClick={() => { setEditProjectsOpen(false); setEditingProjectIdx(null); setMergeMode(false); setMergeSelected([]); setMergeStep("select"); setMergeNewName(""); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Projects</h2>
            <div className="modal-body">
              {mergeStep === "rename" ? (
                <div className="merge-rename-step">
                  <p className="merge-rename-label">Merging {mergeSelected.length} projects into one. Enter a name:</p>
                  <input
                    className="edit-project-input"
                    placeholder="Merged project name..."
                    value={mergeNewName}
                    onChange={(e) => setMergeNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") confirmMerge(); }}
                    autoFocus
                  />
                  <div className="merge-selected-tags">
                    {mergeSelected.map((f) => <span key={f} className="merge-tag">{f}</span>)}
                  </div>
                </div>
              ) : (
                <div className="edit-projects-list">
                  {memoryFilters.filter((f) => f !== "All" && f !== "Untitled").map((f) => {
                    const realIdx = memoryFilters.indexOf(f);
                    return (
                      <div key={f} className={`edit-project-row ${mergeMode ? "merge-mode" : ""}`}>
                        {mergeMode ? (
                          <label className="merge-checkbox-label">
                            <input
                              type="checkbox"
                              className="merge-checkbox"
                              checked={mergeSelected.includes(f)}
                              onChange={(e) => setMergeSelected((prev) => e.target.checked ? [...prev, f] : prev.filter((x) => x !== f))}
                            />
                            <span className="edit-project-name">{f}</span>
                          </label>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    );
                  })}
                  {!mergeMode && (
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
                  )}
                </div>
              )}
            </div>
            <div className="modal-actions">
              {mergeStep === "rename" ? (
                <>
                  <button className="modal-btn cancel" onClick={() => { setEditProjectsOpen(false); setMergeMode(false); setMergeSelected([]); setMergeStep("select"); setMergeNewName(""); }}>Cancel</button>
                  <button className="modal-btn confirm" onClick={confirmMerge} disabled={!mergeNewName.trim()}>Merge</button>
                </>
              ) : mergeMode ? (
                <>
                  <button className="modal-btn cancel" onClick={() => { setEditProjectsOpen(false); setMergeMode(false); setMergeSelected([]); setMergeStep("select"); setMergeNewName(""); }}>Cancel</button>
                  <button className="modal-btn confirm" onClick={() => setMergeStep("rename")} disabled={mergeSelected.length < 2}>
                    Merge {mergeSelected.length > 0 ? `(${mergeSelected.length})` : ""}
                  </button>
                </>
              ) : (
                <>
                  <button className="modal-btn cancel" onClick={() => setMergeMode(true)}>Merge</button>
                  <button className="modal-btn confirm" onClick={() => { setEditProjectsOpen(false); setEditingProjectIdx(null); }}>Done</button>
                </>
              )}
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
