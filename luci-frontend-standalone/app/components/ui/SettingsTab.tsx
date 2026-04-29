import "./SettingsTab.css";

interface SettingsTabProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function SettingsTab({ label, active = false, onClick }: SettingsTabProps) {
  return (
    <button
      className={`settings_tab_item${active ? " active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
