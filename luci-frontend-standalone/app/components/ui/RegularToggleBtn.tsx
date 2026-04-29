import "./RegularToggleBtn.css";

interface RegularToggleBtnProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function RegularToggleBtn({ label, selected = false, onClick, disabled }: RegularToggleBtnProps) {
  return (
    <button
      className={`regular_btn ${selected ? "selected" : "unselected"}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
