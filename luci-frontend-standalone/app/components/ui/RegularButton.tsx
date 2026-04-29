import "./RegularButton.css";

interface RegularButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary";
}

export default function RegularButton({ children, onClick, variant = "default" }: RegularButtonProps) {
  return (
    <button
      className={`regular-btn ${variant === "primary" ? "primary" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
