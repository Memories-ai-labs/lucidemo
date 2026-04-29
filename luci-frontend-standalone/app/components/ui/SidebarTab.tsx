import "./SidebarTab.css";

interface SidebarTabProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function SidebarTab({ icon, label, active = false, onClick }: SidebarTabProps) {
  return (
    <button
      className={active ? "sidebar_btn_selected" : "sidebar_btn_unselected"}
      onClick={onClick}
    >
      <span className="sidebar-tab-icon">{icon}</span>
      <span className="sidebar-tab-label">{label}</span>
    </button>
  );
}
