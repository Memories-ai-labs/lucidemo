import "./IconBtn.css";

interface IconBtnProps {
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export default function IconBtn({ icon, onClick, disabled, style }: IconBtnProps) {
  return (
    <button className="icon_btn" onClick={onClick} disabled={disabled} style={style}>
      {icon}
    </button>
  );
}
