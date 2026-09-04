import React from "react";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children, footer, width }) {
  return (
    <div
      className="fixed inset-0 bg-[rgba(16,20,30,.5)] flex items-center justify-center z-[100] p-5"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[10px] w-[460px] max-w-full shadow-2xl" style={width ? { width } : undefined}>
        <div className="px-[22px] py-[18px] border-b border-line flex items-center justify-between">
          <div className="text-[15px] font-bold text-ink-soft">{title}</div>
          <button className="text-faint hover:bg-paper hover:text-text rounded-md p-1" onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <div className="px-[22px] py-5">{children}</div>
        {footer && <div className="px-[22px] py-4 border-t border-line flex justify-end gap-2.5">{footer}</div>}
      </div>
    </div>
  );
}
