import React from "react";

export default function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="text-center py-11 px-5 text-muted">
      {Icon && <Icon size={30} strokeWidth={1.5} className="text-faint mb-2.5 mx-auto" />}
      <div className="font-semibold text-ink-soft text-sm mb-1">{title}</div>
      <div className="text-[12.5px] max-w-[340px] mx-auto">{desc}</div>
    </div>
  );
}
