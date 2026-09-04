import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldX } from "lucide-react";

export default function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper text-center p-5">
      <div>
        <div className="w-16 h-16 rounded-full bg-red-tint flex items-center justify-center mx-auto mb-4.5">
          <ShieldX size={28} className="text-red" />
        </div>
        <div className="text-xl font-bold text-ink-soft mb-2">403 — Access denied</div>
        <div className="text-[13.5px] text-muted max-w-[360px] mx-auto mb-5">
          Your role doesn't have permission to view this page. If you believe this is a mistake, contact your Admin.
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Return to your dashboard</button>
      </div>
    </div>
  );
}
