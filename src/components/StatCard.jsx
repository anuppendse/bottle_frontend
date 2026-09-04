import React from "react";

export default function StatCard({ label, value, tone }) {
  const toneCls = tone === "recalled" ? "text-red" : "text-ink-soft";
  return (
    <div className="card">
      <div className="text-[11.5px] font-semibold text-faint uppercase tracking-wide mb-1.5">{label}</div>
      <div className={`text-2xl font-bold ${toneCls}`}>{value}</div>
    </div>
  );
}
