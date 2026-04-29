import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import RegularIconButton from "./RegularIconButton";
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
            <RegularIconButton icon={<Pencil size={14} />} onClick={() => onRename(channel)} />
            <RegularIconButton icon={<Trash2 size={14} />} onClick={() => onDelete(channel)} />
          </div>
        )}
        <span className="channel-time">{channel.time}</span>
      </div>
    </div>
  );
}
