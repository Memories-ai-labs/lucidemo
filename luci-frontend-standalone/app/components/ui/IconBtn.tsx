import "./IconBtn.css";

interface IconBtnProps {
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export default function IconBtn({ icon, onClick, disabled }: IconBtnProps) {
  return (
    <button className="icon_btn" onClick={onClick} disabled={disabled}>
      {icon}
    </button>
  );
}
