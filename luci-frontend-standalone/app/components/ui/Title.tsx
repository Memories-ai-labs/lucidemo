import "./Title.css";

interface TitleProps {
  children: React.ReactNode;
  rightBtn?: React.ReactNode;
}

export default function Title({ children, rightBtn }: TitleProps) {
  return (
    <div className="title-row">
      <span className="title-text">{children}</span>
      {rightBtn && <div className="title-right">{rightBtn}</div>}
    </div>
  );
}
