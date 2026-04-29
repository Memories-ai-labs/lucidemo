import type React from "react";
import { ArrowUpRight, Mail, MessageSquare, Pencil, SlidersHorizontal, Trash2, Video } from "lucide-react";
import IconBtn from "./IconBtn";
import "./MemoryCard.css";

export interface Memory {
  id: number;
  title: string;
  date: string;
  duration: string;
  cover: string;
  thumbnail: string;
  participants: Array<{ id: number; avatar: string; name: string }>;
  project: string;
  appType: "Slack" | "Discord" | "Teams" | "Gmail";
  summary?: string;
  sourceUrl?: string;
}

interface MemoryCardProps {
  memory: Memory;
  expanded: boolean;
  onToggleExpand: () => void;
  onEditContent: () => void;
  onEditMeeting: () => void;
  onDelete: () => void;
}

const APP_TYPE_CATEGORY: Record<string, "chat" | "email" | "meeting"> = {
  Slack: "chat",
  Discord: "chat",
  Teams: "meeting",
  Gmail: "email",
};

const MEMORY_TYPE_ICON: Record<string, React.ReactNode> = {
  chat: <MessageSquare size={16} />,
  email: <Mail size={16} />,
  meeting: <Video size={16} />,
};

const APP_SOURCE_ICON: Record<string, { color: string; icon: React.ReactNode }> = {
  Slack: {
    color: "#4A154B",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
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
      <svg viewBox="0 0 24 24" width="16" height="16" fill="#5865F2">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.248-.192.366-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.118.1.24.198.367.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
  },
  Teams: {
    color: "#6264A7",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="#6264A7">
        <path d="M17 3H7v2h3.5v14h3V5H17V3z"/>
        <circle cx="15.5" cy="6.5" r="2.5"/>
        <path d="M18 10h-5v7a2 2 0 002 2h3V10z"/>
      </svg>
    ),
  },
  Gmail: {
    color: "#EA4335",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
        <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" stroke="#EA4335" strokeWidth="1.5"/>
        <path d="M2 6l10 7 10-7" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
};

export default function MemoryCard({
  memory,
  expanded,
  onToggleExpand,
  onEditContent,
  onEditMeeting,
  onDelete,
}: MemoryCardProps) {
  const m = memory;
  const typeIcon = MEMORY_TYPE_ICON[APP_TYPE_CATEGORY[m.appType] ?? "chat"];
  const sourceIcon = APP_SOURCE_ICON[m.appType]?.icon;
  const time = m.date.split(" ")[1]?.slice(0, 5);

  return (
    <div
      className={`memory-card${expanded ? " is-expanded" : ""}`}
      onClick={onToggleExpand}
    >
      <div className="memory-card__header">
        <div className="memory-card__title">
          <span className="memory-card__type-icon">{typeIcon}</span>
          {m.title}
        </div>
        {m.sourceUrl ? (
          <a
            className="memory-card__source"
            href={m.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {sourceIcon}
            <span>{m.appType}</span>
            <ArrowUpRight size={16} />
          </a>
        ) : (
          <div className="memory-card__source memory-card__source--static">
            {sourceIcon}
            <span>{m.appType}</span>
          </div>
        )}
      </div>

      {expanded ? (
        m.summary && <div className="memory-card__summary">{m.summary}</div>
      ) : (
        <div className="memory-card__summary memory-card__summary--collapsed">
          {m.summary ?? `${m.title} — ${m.duration}. Discussion covered key points with ${m.participants[0]?.name ?? "the team"} and follow-up actions were agreed.`}
        </div>
      )}

      <div className="memory-card__footer">
        <span className="memory-card__time">{time}</span>
        {m.participants.length > 0 && (
          <>
            <div className="memory-card__divider" />
            <div className="memory-card__participants">
              {m.participants.slice(0, 4).map((p, idx) => (
                <img
                  key={p.id}
                  src={p.avatar}
                  alt={p.name}
                  className="memory-card__participant"
                  title={p.name}
                  style={{ marginLeft: idx > 0 ? "-6px" : "0" }}
                />
              ))}
            </div>
            <span className="memory-card__participant-names">
              {m.participants.slice(0, 2).map((p) => p.name).join(", ")}
              {m.participants.length > 2 && ` +${m.participants.length - 2}`}
            </span>
          </>
        )}
        <div className="memory-card__actions" onClick={(e) => e.stopPropagation()}>
          <IconBtn icon={<Pencil size={14} />} onClick={onEditContent} style={{ width: 24, height: 24 }} />
          <IconBtn icon={<SlidersHorizontal size={14} />} onClick={onEditMeeting} style={{ width: 24, height: 24 }} />
          <IconBtn icon={<Trash2 size={14} />} onClick={onDelete} style={{ width: 24, height: 24 }} />
        </div>
      </div>
    </div>
  );
}
