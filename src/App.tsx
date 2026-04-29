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
  Clock,
  Layers,
  TrendingUp,
  Plus,
  ArrowLeft,
  Send,
  PanelLeftClose,
  PanelLeftOpen,
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
  Sparkles,
  CornerUpLeft,
  AlignJustify,
  LayoutList,
  ArrowUpRight,
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
  appType: "Slack" | "Discord" | "Teams" | "Gmail";
  summary?: string;
  sourceUrl?: string;
}

const mockMemoryList: Memory[] = [
  {
    id: 1,
    title: "Q1 Planning Meeting",
    date: "2025/04/11 14:03",
    duration: "1h 23m",
    cover: "linear-gradient(135deg,#e8f0fe,#c3d4f8)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
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
    date: "2025/04/11 15:30",
    duration: "45m",
    cover: "linear-gradient(135deg,#fde8f0,#f8c3d4)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project A",
    appType: "Gmail",
    summary: "Reviewed Sprint 4 designs with the team. Alice flagged contrast issues on the dashboard cards and Bob suggested tightening spacing on the nav. Diana confirmed the mobile breakpoints are approved and ready for handoff. Follow-up scheduled for Thursday.",
    sourceUrl: "https://mail.google.com/mail/u/0/#inbox/abc123",
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
    date: "2025/04/11 16:45",
    duration: "58m",
    cover: "linear-gradient(135deg,#e8fde8,#c3f8c3)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Untitled",
    appType: "Discord",
    summary: "Synced on backend blockers and deployment timeline. Charlie raised a concern about the auth service latency under load, and the team agreed to run a stress test before the Friday release window.",
    sourceUrl: "https://discord.com/channels/123456/789012",
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
    appType: "Teams",
    summary: "Walked through the updated roadmap. Three features pushed to Q2 due to resource constraints, and two new requests from sales were added to the backlog. Alice will send a revised timeline to stakeholders by EOD Friday. Charlie flagged dependency on the data team for the analytics milestone.",
    sourceUrl: "https://teams.microsoft.com/l/meetup-join/abc123",
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
    appType: "Slack",
    summary: "Sales kickoff went well. Targets set for H1.",
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
    appType: "Teams",
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
    appType: "Gmail",
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
    appType: "Teams",
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
    appType: "Teams",
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
    appType: "Gmail",
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
    appType: "Slack",
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
    appType: "Discord",
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
    date: "2026/04/11 10:00",
    duration: "50m",
    cover: "linear-gradient(135deg,#fde8f0,#f8c3d4)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project A",
    appType: "Discord",
    summary: "Alice kicked off the notification system feature with a detailed breakdown of requirements and shared a Figma link covering 4 screen states. Charlie flagged a potential conflict with the existing push permission flow and suggested a brief sync before dev starts. Eve confirmed she could pick up the backend event schema this sprint without blocking the frontend work. The team agreed on a kickoff sync for Friday 10am to align on edge cases and mobile behaviour. Alice will send out a written spec recap by EOD Wednesday so everyone can async-review before the meeting.",
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
    appType: "Teams",
    summary: "Bob walked through the proposed REST structure for three new endpoints and Diana immediately raised concerns about pagination consistency with existing routes. Frank suggested adopting cursor-based pagination to align with what the mobile client already expects, sharing a short code snippet in chat. Henry confirmed the auth middleware would support the new token scopes without any changes to the permission layer. The team agreed to draft a formal API contract doc before implementation begins, with Bob owning the first draft by Monday. Diana will schedule a 30-min follow-up next week to review the draft before it goes to the wider engineering group.",
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
    date: "2026/04/09 09:30",
    duration: "1h 20m",
    cover: "linear-gradient(135deg,#e8fde8,#c3f8c3)",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    project: "Project A",
    appType: "Slack",
    summary: "Alice shared the sprint board and walked through 14 candidate tickets, opening the floor for estimates and blockers before committing anything. Bob flagged that the search indexing task was blocked on a data team dependency and proposed sliding it to the following sprint rather than holding the team up. Charlie and Diana voted to pull in the notification preferences feature at 5 story points, noting it unblocked a pending design handoff. Eve confirmed she'd handle QA sign-off for all frontend changes this cycle and asked for a 2-day buffer at the end of the sprint. The team closed with 11 committed tickets and a shared velocity target of 42 points, with Alice posting the final board link in the channel.",
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
    appType: "Gmail",
    summary: "Bob sent a detailed email outlining three frontend architecture options — monorepo split, micro-frontend, and a feature-folder restructure — with pros and cons for each. Frank replied with a performance benchmark comparing bundle sizes across the options, noting the feature-folder approach shipped fastest in his test environment. Iris forwarded a relevant case study from a previous team that had evaluated similar trade-offs at a similar scale. Bob followed up with a consolidated trade-off summary and proposed a final decision meeting for next Tuesday afternoon. The thread ended with general team consensus leaning toward the feature-folder approach pending the Tuesday meeting.",
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
    appType: "Slack",
    summary: "Charlie opened the triage thread with a list of 7 bugs flagged from the 2.1 release candidate, each with a severity tag and reproduction steps linked. Eve confirmed 3 were already fixed in her branch and would be merged by end of day, clearing the highest-priority items immediately. Grace identified that bug #4 was a regression introduced in last week's layout refactor and self-assigned it with a fix ETA of tomorrow morning. Kate asked for a reproduction case for bug #6 which appeared intermittent on Safari and couldn't be reproduced in Chromium. The thread closed with 5 of 7 bugs assigned and a shared goal of clearing the full backlog before Thursday's release window opens.",
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
    appType: "Discord",
    summary: "Alice walked stakeholders through the beta build's three core flows — onboarding, dashboard, and settings — using the staging environment via screen share. Bob handled live Q&A and noted two out-of-scope feature requests from attendees, logging them to the backlog for future sprint consideration. Diana shared a side-by-side comparison of old and new UI to highlight the design improvements, which drew strong positive reactions from the client. Frank flagged a loading state bug that appeared mid-demo and immediately created a hotfix ticket with reproduction steps. Henry and Jack both approved proceeding to the next milestone, with a final sign-off email to follow by end of week.",
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


const mockMomentsTodos = [
  { id: 1, text: "Review design feedback from team", done: false },
  { id: 2, text: "Update project documentation", done: true },
  { id: 3, text: "Schedule weekly sync meeting", done: false },
  { id: 4, text: "Fix navigation animation bug", done: false },
];

const mockUpcomingMeetings = [
  {
    id: 1,
    title: "Product Review",
    datetime: "Apr 22 · 10:00 AM",
    duration: "1h",
    brief: [
      "You committed to finishing the onboarding flow mockups by Apr 20 — confirm before the meeting.",
      "Bob raised API rate limit concerns last time; you said you'd follow up with infra. Sara's design system audit is still pending.",
      "The Q2 roadmap cut two features to the next cycle — expect pushback from stakeholders; prepare a rationale for the scope change.",
    ],
    participants: [
      { name: "Alice Chen", avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=1", role: "Product Manager", linkedin: "https://linkedin.com/in/alicechen" },
      { name: "Bob Kim", avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", role: "Engineering Lead", linkedin: "https://linkedin.com/in/bobkim" },
      { name: "Sara Lim", avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=3", role: "Designer", linkedin: "https://linkedin.com/in/saralim" },
    ],
  },
  {
    id: 2,
    title: "Engineering Weekly",
    datetime: "Apr 23 · 2:00 PM",
    duration: "45m",
    brief: ["Weekly engineering sync covering sprint progress, blockers, and upcoming deployment schedule for v1.3."],
    participants: [
      { name: "David Park", avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=4", role: "Backend Engineer", linkedin: "https://linkedin.com/in/davidpark" },
      { name: "Mia Torres", avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=5", role: "Frontend Engineer", linkedin: "https://linkedin.com/in/miatorres" },
      { name: "Jake Wu", avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=6", role: "DevOps", linkedin: "https://linkedin.com/in/jakewu" },
      { name: "Nina Patel", avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=7", role: "QA Engineer", linkedin: "https://linkedin.com/in/ninapatel" },
    ],
  },
  {
    id: 3,
    title: "Design Critique",
    datetime: "Apr 24 · 11:30 AM",
    duration: "1h 30m",
    brief: ["Design review session for the new onboarding flow. Sharing Figma prototypes and collecting structured feedback."],
    participants: [
      { name: "Bob Kim", avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=2", role: "Engineering Lead", linkedin: "https://linkedin.com/in/bobkim" },
      { name: "Lily Zhao", avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=8", role: "UX Researcher", linkedin: "https://linkedin.com/in/lilyzhao" },
    ],
  },
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

type NavItem = "ask" | "memories" | "moments" | "settings";

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

const APP_ICON_CONFIG: Record<string, { bg: string; icon: JSX.Element }> = {
  Slack: {
    bg: "#4A154B",
    icon: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
        <rect x="3" y="9" width="8" height="3" rx="1.5" fill="white"/>
        <rect x="13" y="12" width="8" height="3" rx="1.5" fill="white"/>
        <rect x="9" y="3" width="3" height="8" rx="1.5" fill="white"/>
        <rect x="12" y="13" width="3" height="8" rx="1.5" fill="white"/>
        <circle cx="11" cy="12" r="1.5" fill="white"/>
        <circle cx="13" cy="12" r="1.5" fill="white"/>
      </svg>
    ),
  },
  Discord: {
    bg: "#5865F2",
    icon: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="white">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.248-.192.366-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.118.1.24.198.367.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
  },
  Teams: {
    bg: "#6264A7",
    icon: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="white">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" opacity="0" />
        <path d="M17 3H7v2h3.5v14h3V5H17V3z"/>
        <circle cx="15.5" cy="6.5" r="2.5"/>
        <path d="M18 10h-5v7a2 2 0 002 2h3V10z"/>
      </svg>
    ),
  },
  Gmail: {
    bg: "#EA4335",
    icon: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
        <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" stroke="white" strokeWidth="1.5"/>
        <path d="M2 6l10 7 10-7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
};

const APP_SOURCE_ICON: Record<string, { color: string; icon: JSX.Element }> = {
  Slack: {
    color: "#4A154B",
    icon: (
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
        <rect x="3" y="9" width="8" height="3" rx="1.5" fill="#4A154B"/>
        <rect x="13" y="12" width="8" height="3" rx="1.5" fill="#4A154B"/>
        <rect x="9" y="3" width="3" height="8" rx="1.5" fill="#4A154B"/>
        <rect x="12" y="13" width="3" height="8" rx="1.5" fill="#4A154B"/>
        <circle cx="11" cy="12" r="1.5" fill="#4A154B"/>
        <circle cx="13" cy="12" r="1.5" fill="#4A154B"/>
      </svg>
    ),
  },
  Discord: {
    color: "#5865F2",
    icon: (
      <svg viewBox="0 0 24 24" width="12" height="12" fill="#5865F2">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.248-.192.366-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.118.1.24.198.367.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
  },
  Teams: {
    color: "#6264A7",
    icon: (
      <svg viewBox="0 0 24 24" width="12" height="12" fill="#6264A7">
        <path d="M17 3H7v2h3.5v14h3V5H17V3z"/>
        <circle cx="15.5" cy="6.5" r="2.5"/>
        <path d="M18 10h-5v7a2 2 0 002 2h3V10z"/>
      </svg>
    ),
  },
  Gmail: {
    color: "#EA4335",
    icon: (
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
        <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" stroke="#EA4335" strokeWidth="1.5"/>
        <path d="M2 6l10 7 10-7" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
};

function AppIconBadge({ appType }: { appType: string }) {
  const config = APP_ICON_CONFIG[appType] ?? APP_ICON_CONFIG["Gmail"];
  return (
    <div className="timeline-icon-badge" style={{ background: config.bg }}>
      {config.icon}
    </div>
  );
}

function handleDragStart(e: React.MouseEvent) {
  if (e.button !== 0) return;
  getCurrentWindow().startDragging();
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState<NavItem>("moments");
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
  const [expandedSummaries, setExpandedSummaries] = useState<Set<number>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [cardViewMode, setCardViewMode] = useState<"compact" | "expanded">("compact");
  const [memoryMenuId, setMemoryMenuId] = useState<number | null>(null);
  const [renameMemoryTarget, setRenameMemoryTarget] = useState<Memory | null>(null);
  const [renameMemoryValue, setRenameMemoryValue] = useState("");
  const [deleteMemoryTarget, setDeleteMemoryTarget] = useState<Memory | null>(null);
  const [memoryTab, setMemoryTab] = useState<"daily" | "meetings" | "people" | "library">("meetings");
  const [dailyDate, setDailyDate] = useState("2026-04-11");
  const dailyScrollRef = useRef<HTMLDivElement>(null);
  const ptScrollRef = useRef<HTMLDivElement>(null);
  const chartScrollRef = useRef<HTMLDivElement>(null);
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
  const [momentsTodos, setMomentsTodos] = useState(mockMomentsTodos);
  const [editMeetingTarget, setEditMeetingTarget] = useState<Memory | null>(null);
  const [editMeetingProject, setEditMeetingProject] = useState("");
  const [editMeetingParticipants, setEditMeetingParticipants] = useState<Memory["participants"]>([]);
  const [editContentTarget, setEditContentTarget] = useState<Memory | null>(null);
  const [editContentTitle, setEditContentTitle] = useState("");
  const [editContentSummary, setEditContentSummary] = useState("");
  const [editContentDate, setEditContentDate] = useState("");
  const [editContentAppType, setEditContentAppType] = useState<Memory["appType"]>("Slack");
  const [createMemoryOpen, setCreateMemoryOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createSummary, setCreateSummary] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createAppType, setCreateAppType] = useState<Memory["appType"]>("Slack");

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

  useEffect(() => {
    if (ptScrollRef.current) {
      const acts = mockDailyActivities.filter(a => a.date === dailyDate).sort((a, b) => a.time.localeCompare(b.time));
      if (acts.length > 0) {
        const [h] = acts[0].time.split(":").map(Number);
        ptScrollRef.current.scrollTop = Math.max(0, h - 1) * 80;
      }
    }
  }, [memoryTab, dailyDate]);

  useEffect(() => {
    if (chartScrollRef.current) {
      const COL_WIDTH = 40;
      chartScrollRef.current.scrollLeft = 9 * COL_WIDTH;
    }
  }, [activeNav]);

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

  function openCreateMemory() {
    setCreateTitle("");
    setCreateSummary("");
    setCreateDate(new Date().toLocaleString("sv").replace("T", " ").slice(0, 16));
    setCreateAppType("Slack");
    setCreateMemoryOpen(true);
  }

  function confirmCreateMemory() {
    const newMemory: Memory = {
      id: Date.now(),
      title: createTitle || "Untitled",
      summary: createSummary || undefined,
      date: createDate,
      duration: "",
      cover: "linear-gradient(135deg,#e8f0fe,#c3d4f8)",
      thumbnail: "",
      project: memoryFilter === "All" ? "Untitled" : memoryFilter,
      appType: createAppType,
      participants: [],
    };
    setMemoryList((prev) => [newMemory, ...prev]);
    setCreateMemoryOpen(false);
  }

  function openEditContent(m: Memory) {
    setEditContentTarget(m);
    setEditContentTitle(m.title);
    setEditContentSummary(m.summary ?? "");
    setEditContentDate(m.date);
    setEditContentAppType(m.appType);
  }

  function confirmEditContent() {
    if (!editContentTarget) return;
    setMemoryList((prev) =>
      prev.map((m) =>
        m.id === editContentTarget.id
          ? { ...m, title: editContentTitle, summary: editContentSummary, date: editContentDate, appType: editContentAppType }
          : m
      )
    );
    setEditContentTarget(null);
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
          <MenuBarTab icon={<Clock size={16} />} label="Moments" active={activeNav === "moments"} onClick={() => setActiveNav("moments")} />
          <MenuBarTab icon={<MessageCircle size={16} />} label="Ask LUCI" active={activeNav === "ask"} onClick={() => setActiveNav("ask")} />
          <MenuBarTab icon={<BookMarked size={16} />} label="Memories" active={activeNav === "memories"} onClick={() => setActiveNav("memories")} />
          <MenuBarTab icon={<Settings size={16} />} label="Settings" active={activeNav === "settings"} onClick={() => setActiveNav("settings")} />
        </nav>

      </aside>

      {/* ── Main ── */}
      <main className={`main ${sidebarOpen ? "with-sidebar" : "centered"}`}>
        {/* drag region for window when sidebar is closed */}
        <div className="main-drag" onMouseDown={handleDragStart} />
        {activeNav === "memories" && !activeChannel ? (
          <div className="memories-view">
            <h1 className="memories-title">Memories</h1>
            <div className="memories-tabs">
              {(["meetings", "people", "library", "daily"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`memory-tab ${memoryTab === tab ? "active" : ""}`}
                  style={tab === "daily" ? { opacity: 0.1 } : undefined}
                  onClick={() => { setMemoryTab(tab); }}
                >
                  {tab === "daily" ? "Daily" : tab === "meetings" ? "Project" : tab === "people" ? "People" : "Library"}
                </button>
              ))}
            </div>
            {(memoryTab === "meetings" || memoryTab === "people") && <>
            {memoryTab === "meetings" && (
              <div className="memory-filter-row">
                <select
                  className="project-filter-select"
                  value={memoryFilter}
                  onChange={(e) => setMemoryFilter(e.target.value)}
                >
                  <option value="All">All Projects</option>
                  {[...memoryFilters.filter((f) => f !== "Untitled" && f !== "All"), "Untitled"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <div className="memory-filter-row-right">
                <button className="memory-create-btn" onClick={openCreateMemory}>
                  <Plus size={13} />
                </button>
                <div className="memory-view-toggle">
                  <button
                    className={`memory-view-btn${cardViewMode === "compact" ? " active" : ""}`}
                    onClick={() => setCardViewMode("compact")}
                    title="Compact"
                  ><AlignJustify size={13} /></button>
                  <button
                    className={`memory-view-btn${cardViewMode === "expanded" ? " active" : ""}`}
                    onClick={() => setCardViewMode("expanded")}
                    title="Expanded"
                  ><LayoutList size={13} /></button>
                </div>
                </div>
              </div>
            )}
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
                    {sortedDates.map((dateStr, dateIdx) => {
                      const dateObj = new Date(dateStr);
                      const day = dateObj.getDate();
                      const month = dateObj.toLocaleString("en-US", { month: "short" });
                      const items = groupedByDate[dateStr];
                      return (
                        <div key={dateStr} className="memory-date-group">
                          <div className="memory-date-label">
                            <span className="memory-date-day">{day}</span>
                            <span className="memory-date-month">{month}</span>
                            {dateIdx < sortedDates.length - 1 && (
                              <div className="memory-date-connector" />
                            )}
                          </div>
                          <div className="memory-date-cards">
                            {items.map((m, itemIdx) => {
                              const isVeryFirst = dateIdx === 0 && itemIdx === 0;
                              return (
                                <div
                                  key={m.id}
                                  className="memory-list-item"
                                  onClick={() => setExpandedCards(prev => {
                                    const next = new Set(prev);
                                    if (next.has(m.id)) next.delete(m.id); else next.add(m.id);
                                    return next;
                                  })}
                                >
                                  <div className="memory-card-header-row">
                                    <div className="memory-subject">{m.title}</div>
                                    <span className="memory-card-time">{m.date.split(" ")[1]?.slice(0, 5)}</span>
                                    <div className="memory-card-actions" onClick={(e) => e.stopPropagation()}>
                                      <button className="memory-card-action-btn" title="Edit" onClick={() => openEditContent(m)}><Pencil size={12} /></button>
                                      <button className="memory-card-action-btn" title="Configure" onClick={() => openEditMeeting(m)}><SlidersHorizontal size={12} /></button>
                                      <button className="memory-card-action-btn danger" title="Delete" onClick={() => setDeleteMemoryTarget(m)}><Trash2 size={12} /></button>
                                    </div>
                                  </div>
                                  {(cardViewMode === "expanded" || expandedCards.has(m.id)) ? (
                                    <>
                                      {m.summary && (
                                        <div className="memory-summary-text">{m.summary}</div>
                                      )}
                                      <div className="memory-participants">
                                        {m.participants.length > 0 && <>
                                          <div className="participant-avatars">
                                            {m.participants.slice(0, isVeryFirst ? 5 : 4).map((p, idx) => (
                                              <img key={p.id} src={p.avatar} alt={p.name} className="participant-avatar" title={p.name} style={{ marginLeft: idx > 0 ? "-8px" : "0" }} />
                                            ))}
                                          </div>
                                          <span className="participants-names">
                                            {m.participants.slice(0, 2).map((p) => p.name).join(", ")}
                                            {m.participants.length > 2 && ` +${m.participants.length - 2}`}
                                          </span>
                                        </>}
                                        <a
                                          className="memory-source-link"
                                          href={m.sourceUrl ?? "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          style={{ opacity: m.sourceUrl ? 1 : 0.35, pointerEvents: m.sourceUrl ? "auto" : "none" }}
                                        >
                                          {APP_SOURCE_ICON[m.appType]?.icon}
                                          <span className="memory-source-label">{m.appType}</span>
                                          <ArrowUpRight size={11} />
                                        </a>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="memory-summary-text memory-summary-collapsed">
                                      {m.summary ?? `${m.title} — ${m.duration}. Discussion covered key points with ${m.participants[0]?.name ?? "the team"} and follow-up actions were agreed.`}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            </>
            </>}
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
        ) : activeNav === "moments" && !activeChannel ? (() => {
          const activities = mockDailyActivities.filter(a => a.date === dailyDate).sort((a, b) => a.time.localeCompare(b.time));
          const appUsageMap: Record<string, { app: string; appIcon: string; totalMins: number }> = {};
          activities.forEach(a => {
            if (!appUsageMap[a.app]) appUsageMap[a.app] = { app: a.app, appIcon: a.appIcon, totalMins: 0 };
            appUsageMap[a.app].totalMins += a.duration;
          });
          const orangeShades = ["#FFD08A", "#FFD9A0", "#FFE2B5", "#FFEACC", "#FFF1DD", "#FFF7EE"];
          const appColors: Record<string, string> = {};
          [...new Set(activities.map(a => a.app))].forEach((app, i) => { appColors[app] = orangeShades[i % orangeShades.length]; });
          const byHour: Record<number, Array<{ app: string; duration: number }>> = {};
          activities.forEach(a => {
            const h = parseInt(a.time.split(":")[0]);
            if (!byHour[h]) byHour[h] = [];
            byHour[h].push({ app: a.app, duration: a.duration });
          });
          const maxHourMins = Math.max(...Object.values(byHour).map(acts => acts.reduce((s, a) => s + a.duration, 0)), 1);
          return (
            <div className="memories-view moments-view">
              <div className="moments-title-row">
                <h1 className="memories-title">Hello, Shawn</h1>
                <span className="moments-date">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </span>
              </div>
              <div className="moments-body">
                <div className="moments-right">
                  <div className="moments-panel">
                    <div className="moments-panel-title">Todo</div>
                    <div className="moments-todo-list">
                      {momentsTodos.map(item => (
                        <div key={item.id} className="moments-todo-item" onClick={() => setMomentsTodos(prev => prev.map(t => t.id === item.id ? { ...t, done: !t.done } : t))}>
                          {item.done
                            ? <span className="personal-check-done"><Check size={10} /></span>
                            : <span className="personal-check-empty" />}
                          <span className={`moments-todo-text${item.done ? " done" : ""}`}>{item.text}</span>
                          {!item.done && <button className="moments-todo-ask-btn" onClick={e => { e.stopPropagation(); setActiveNav("ask"); }}>Ask LUCI</button>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="moments-left">
                  <div className="moments-panel">
                    <div className="moments-panel-title">Upcoming Meeting</div>
                    {(() => {
                      const m = mockUpcomingMeetings[0];
                      return (
                        <div className="moments-next-meeting">
                          <div className="moments-meeting-header">
                            <span className="moments-meeting-title">{m.title}</span>
                            <button className="moments-record-btn">Start Recording</button>
                          </div>
                          <span className="moments-meeting-datetime">{m.datetime}</span>
                          <div className="moments-meeting-body">
                            <div className="moments-panel-title"><Sparkles size={10} style={{ marginRight: 4, verticalAlign: "middle", color: "#FF8C00", fill: "#FF8C00" }} />Context from last time</div>
                            <ul className="moments-meeting-brief">
                              {m.brief.map((line, i) => <li key={i}>{line}</li>)}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="moments-panel">
                    <div className="moments-panel-title">Screen Activity</div>
                    <div className="moments-chart-wrap">
                      <div className="moments-chart-scroll" ref={chartScrollRef}>
                      <div className="moments-chart-area">
                        <div className="moments-chart-cols">
                          {Array.from({ length: 24 }, (_, h) => {
                            const acts = byHour[h] || [];
                            const totalMins = acts.reduce((s, a) => s + a.duration, 0);
                            const heightPct = (totalMins / maxHourMins) * 100;
                            return (
                              <div key={h} className="moments-chart-col">
                                {totalMins > 0 ? (
                                  <>
                                    <div className="moments-chart-bar" style={{ height: `${heightPct}%` }}>
                                      {acts.sort((a, b) => b.duration - a.duration).map((a, i) => (
                                        <div key={i} className="moments-chart-seg" style={{ flex: a.duration, background: appColors[a.app] }} />
                                      ))}
                                    </div>
                                  </>
                                ) : (
                                  <div className="moments-chart-bar-empty" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="moments-chart-baseline" />
                        <div className="moments-chart-xaxis">
                          {Array.from({ length: 24 }, (_, h) => (
                            <span key={h} className="moments-chart-xtick">
                              {h % 4 === 0 ? `${String(h).padStart(2, "0")}:00` : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })() : activeNav === "settings" && !activeChannel ? (
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
              <h1 className="greeting">How can I help you?</h1>
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
            <h2 className="modal-title">Configure</h2>
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

      {editContentTarget && (
        <div className="modal-backdrop" onClick={() => setEditContentTarget(null)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit</h2>
            <div className="modal-body">
              <div className="em-section">
                <div className="em-label">Title</div>
                <input
                  className="em-input"
                  value={editContentTitle}
                  onChange={(e) => setEditContentTitle(e.target.value)}
                  placeholder="Meeting title"
                />
              </div>
              <div className="em-section">
                <div className="em-label">Summary</div>
                <textarea
                  className="em-textarea"
                  value={editContentSummary}
                  onChange={(e) => setEditContentSummary(e.target.value)}
                  placeholder="Summary"
                  rows={4}
                />
              </div>
              <div className="em-section">
                <div className="em-label">Time</div>
                <input
                  className="em-input"
                  value={editContentDate}
                  onChange={(e) => setEditContentDate(e.target.value)}
                  placeholder="e.g. 2026/04/11 14:00"
                />
              </div>
              <div className="em-section">
                <div className="em-label">Source</div>
                <div className="em-project-pills">
                  {(["Slack", "Discord", "Teams", "Gmail"] as Memory["appType"][]).map((t) => (
                    <button
                      key={t}
                      className={`em-project-pill ${editContentAppType === t ? "active" : ""}`}
                      onClick={() => setEditContentAppType(t)}
                    >{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setEditContentTarget(null)}>Cancel</button>
              <button className="modal-btn confirm" onClick={confirmEditContent}>Save</button>
            </div>
          </div>
        </div>
      )}

      {createMemoryOpen && (
        <div className="modal-backdrop" onClick={() => setCreateMemoryOpen(false)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">New Memory</h2>
            <div className="modal-body">
              <div className="em-section">
                <div className="em-label">Title</div>
                <input className="em-input" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} placeholder="Meeting title" />
              </div>
              <div className="em-section">
                <div className="em-label">Summary</div>
                <textarea className="em-textarea" value={createSummary} onChange={(e) => setCreateSummary(e.target.value)} placeholder="Summary" rows={4} />
              </div>
              <div className="em-section">
                <div className="em-label">Time</div>
                <input className="em-input" value={createDate} onChange={(e) => setCreateDate(e.target.value)} placeholder="e.g. 2026/04/11 14:00" />
              </div>
              <div className="em-section">
                <div className="em-label">Source</div>
                <div className="em-project-pills">
                  {(["Slack", "Discord", "Teams", "Gmail"] as Memory["appType"][]).map((t) => (
                    <button key={t} className={`em-project-pill ${createAppType === t ? "active" : ""}`} onClick={() => setCreateAppType(t)}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setCreateMemoryOpen(false)}>Cancel</button>
              <button className="modal-btn confirm" onClick={confirmCreateMemory}>Create</button>
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
