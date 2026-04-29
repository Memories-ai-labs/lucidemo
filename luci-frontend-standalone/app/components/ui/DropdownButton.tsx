import { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import "./DropdownButton.css";

interface DropdownButtonProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default function DropdownButton({ value, options, onChange }: DropdownButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="filter_dropdown" ref={ref}>
      <button
        className={`filter_dropdown_trigger${open ? " open" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <SlidersHorizontal size={16} />
        <span className="filter_dropdown_label">{value}</span>
        <ChevronDown size={16} className={`filter_dropdown_chevron${open ? " open" : ""}`} />
      </button>

      {open && (
        <div className="filter_dropdown_menu">
          {options.map((opt) => (
            <button
              key={opt}
              className={`filter_dropdown_option${value === opt ? " selected" : ""}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              <span>{opt}</span>
              {value === opt && <Check size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
