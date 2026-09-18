import "./IconBtn.css";

interface IconBtnProps {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  title?: string;
}

export default function IconBtn({ icon, label, onClick, disabled, style, title }: IconBtnProps) {
  return (
    <button
      className={`icon_btn${label ? " icon_btn--with-label" : ""}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
      title={title}
    >
      {icon}
      {label && <span className="icon_btn-label">{label}</span>}
    </button>
  );
}
