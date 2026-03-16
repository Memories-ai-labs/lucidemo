import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import "./ChannelItem.css";

export interface Channel {
  id: number;
  name: string;
  desc: string;
  time: string;
}

interface ChannelItemProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
  onRename: (channel: Channel) => void;
  onDelete: (channel: Channel) => void;
}

export default function ChannelItem({ channel, onClick, onRename, onDelete }: ChannelItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`channel-item ${hovered ? "hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(channel)}
    >
      <div className="channel-icon">#</div>
      <div className="channel-info">
        <span className="channel-name">{channel.name}</span>
        <span className="channel-desc">{channel.desc}</span>
      </div>
      <div className="channel-right">
        {hovered && (
          <div className="channel-actions" onClick={(e) => e.stopPropagation()}>
            <button className="action-btn" onClick={() => onRename(channel)}>
              <Pencil size={14} />
            </button>
            <button className="action-btn" onClick={() => onDelete(channel)}>
              <Trash2 size={14} />
            </button>
          </div>
        )}
        <span className="channel-time">{channel.time}</span>
      </div>
    </div>
  );
}
