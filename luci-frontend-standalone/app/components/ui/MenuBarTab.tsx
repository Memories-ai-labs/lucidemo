import "./MenuBarTab.css";

interface MenuBarTabProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function MenuBarTab({ icon, label, active = false, onClick }: MenuBarTabProps) {
  return (
    <button className={`menu-bar-tab ${active ? "active" : ""}`} onClick={onClick}>
      <span className="menu-bar-tab-icon">{icon}</span>
      <span className="menu-bar-tab-label">{label}</span>
    </button>
  );
}
