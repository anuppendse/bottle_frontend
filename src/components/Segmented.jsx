import React from "react";

export default function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex border border-line-strong rounded-md overflow-hidden">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-4 py-2 text-[13px] font-semibold border-r last:border-r-0 border-line-strong ${
            value === o ? "bg-accent-tint text-accent-dark" : "bg-white text-muted hover:bg-[#FAFAF8]"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
