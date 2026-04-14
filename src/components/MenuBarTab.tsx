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
      {icon}
      <span>{label}</span>
    </button>
  );
}
