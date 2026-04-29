import "./SegmentBtn.css";

export interface SegmentBtnOption {
  value: string;
  icon: React.ReactNode;
  title?: string;
}

interface SegmentBtnProps {
  options: SegmentBtnOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function SegmentBtn({ options, value, onChange }: SegmentBtnProps) {
  return (
    <div className="segment_btn">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`segment_btn_item${value === opt.value ? " active" : ""}`}
          onClick={() => onChange(opt.value)}
          title={opt.title}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
