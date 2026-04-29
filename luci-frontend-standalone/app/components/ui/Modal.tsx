import { useEffect, useRef } from "react";
import "./Modal.css";

interface ModalProps {
  title: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDanger?: boolean;
  children?: React.ReactNode;
}

export default function Modal({
  title,
  open,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmDanger = false,
  children,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onCancel}>{cancelLabel}</button>
          <button className={`modal-btn confirm ${confirmDanger ? "danger" : ""}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
