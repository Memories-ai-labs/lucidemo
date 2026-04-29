import "./RegularIconButton.css";

interface RegularIconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outlined";
}

export default function RegularIconButton({ icon, onClick, variant = "default" }: RegularIconButtonProps) {
  return (
    <button className={`regular-icon-btn ${variant === "outlined" ? "outlined" : ""}`} onClick={onClick}>
      {icon}
    </button>
  );
}
