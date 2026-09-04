import React from "react";

export default function PageHead({ eyebrow, title, desc, action }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
      <div>
        {eyebrow && <div className="text-xs text-faint font-semibold mb-1">{eyebrow}</div>}
        <div className="text-[22px] font-bold text-ink-soft">{title}</div>
        {desc && <div className="text-[13px] text-muted mt-1 max-w-[560px]">{desc}</div>}
      </div>
      {action}
    </div>
  );
}
