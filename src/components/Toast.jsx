import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Toast({ toast }) {
  if (!toast) return null;
  const border = toast.type === "err" ? "border-l-red" : "border-l-green";
  return (
    <div className={`fixed bottom-6 right-6 bg-ink text-white px-[18px] py-[13px] rounded-lg text-[13.5px] flex items-center gap-2.5 shadow-2xl z-[200] border-l-[3px] ${border}`}>
      {toast.type === "err" ? <XCircle size={16} /> : <CheckCircle2 size={16} />} {toast.msg}
    </div>
  );
}
