import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";
export function Icon({ icon: Component, ...props }) {
  return (
    <Component size={16} strokeWidth={1.7} aria-hidden="true" {...props} />
  );
}
export function Dialog({
  title,
  eyebrow,
  onClose,
  children,
  wide = false,
  returnFocus,
}) {
  const ref = useRef(null);
  useEffect(() => {
    const trigger = document.activeElement;
    ref.current.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      const target = returnFocus?.current ?? trigger;
      if (target?.isConnected) target.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "drawer" : "modal"}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-inner">
        <header className="dialog-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id="dialog-title">{title}</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
            autoFocus
          >
            <Icon icon={X} size={22} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
export function Highlight({ text, passage }) {
  const start = text.indexOf(passage);
  if (start < 0) return text;
  return (
    <>
      {text.slice(0, start)}
      <mark>{passage}</mark>
      {text.slice(start + passage.length)}
    </>
  );
}
