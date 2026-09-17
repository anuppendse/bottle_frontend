import React, { useState, useMemo } from "react";
import {
  LayoutDashboard, Users as UsersIcon, Package, QrCode,
  Boxes, AlertTriangle, Download, LogOut, ChevronDown, X, Plus, Filter,
  ShieldCheck, ShieldAlert, ShieldX, Eye, EyeOff, ClipboardList,
  RefreshCw, MessageSquareWarning, ChevronRight, Clock, CheckCircle2,
  XCircle, FileWarning, Printer, ArrowLeft, KeyRound, Settings, Truck
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";

/* ============================================================
   DESIGN TOKENS
   ============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.lt-root {
  --ink: #101C34;
  --ink-soft: #1B2A4A;
  --paper: #F4F5F2;
  --surface: #FFFFFF;
  --line: #E1E3DE;
  --line-strong: #CBCEC8;
  --accent: #0E7C74;
  --accent-dark: #0A5E58;
  --accent-tint: #E4F1EF;
  --text: #182233;
  --muted: #5C6572;
  --faint: #8A8F97;
  --green: #1E8E5A; --green-tint:#E6F5EC;
  --amber: #A9720B; --amber-tint:#FBF0DA;
  --red: #B0362B; --red-tint:#FAE7E4;
  --grey: #667080; --grey-tint:#EDEEF0;
  font-family: 'IBM Plex Sans', -apple-system, sans-serif;
  color: var(--text);
  background: var(--paper);
  width: 100%;
  min-height: 100vh;
  position: relative;
}
.lt-root * { box-sizing: border-box; }
.lt-mono { font-family: 'IBM Plex Mono', monospace; }
.lt-root button { font-family: inherit; cursor: pointer; }
.lt-root input, .lt-root select, .lt-root textarea { font-family: inherit; }
.lt-root ::selection { background: var(--accent-tint); }

/* ---------- Buttons ---------- */
.btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 16px; font-size: 13.5px; font-weight: 600;
  border-radius: 5px; border: 1px solid transparent; transition: all .12s ease;
  white-space: nowrap; line-height: 1.1;
}
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-dark); }
.btn-primary:disabled { background: #B7C4C2; cursor: not-allowed; }
.btn-outline { background: transparent; border-color: var(--line-strong); color: var(--text); }
.btn-outline:hover { border-color: var(--accent); color: var(--accent-dark); background: var(--accent-tint); }
.btn-ghost { background: transparent; color: var(--muted); border-color: transparent; }
.btn-ghost:hover { background: #ECEDEA; color: var(--text); }
.btn-danger { background: var(--red); color: #fff; }
.btn-danger:hover { background: #8F291F; }
.btn-sm { padding: 6px 11px; font-size: 12.5px; }

/* ---------- Layout ---------- */
.lt-shell { display: flex; min-height: 100vh; }
.lt-sidebar {
  width: 240px; background: var(--ink); color: #C9D2DE; flex-shrink: 0;
  display: flex; flex-direction: column; position: sticky; top:0; height: 100vh;
}
.lt-brand { padding: 22px 22px 18px; display:flex; align-items:center; gap:10px; border-bottom: 1px solid rgba(255,255,255,.08); }
.lt-brand-mark { width:30px; height:30px; border-radius:6px; background: var(--accent); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
.lt-brand-name { font-weight: 700; font-size: 15.5px; color: #fff; letter-spacing: .2px; }
.lt-brand-sub { font-size: 10.5px; color: #7C8AA3; margin-top: 1px; }
.lt-nav { padding: 14px 12px; flex: 1; overflow-y:auto; }
.lt-nav-item {
  display:flex; align-items:center; gap:11px; padding: 9px 12px; border-radius: 6px;
  font-size: 13.5px; font-weight: 500; color: #A9B4C6; margin-bottom: 2px; transition: all .12s;
  border: 1px solid transparent; width: 100%; text-align:left; background:transparent;
}
.lt-nav-item:hover { background: rgba(255,255,255,.05); color: #fff; }
.lt-nav-item.active { background: rgba(14,124,116,.22); color: #fff; border-color: rgba(14,124,116,.4); }
.lt-nav-item svg { flex-shrink:0; }
.lt-nav-section { font-size:10.5px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; color:#5B6A87; padding: 14px 12px 6px; }
.lt-nav-section:first-child { padding-top: 4px; }

/* ---------- Segmented control ---------- */
.lt-segment { display:inline-flex; border:1px solid var(--line-strong); border-radius:6px; overflow:hidden; }
.lt-segment button { background:#fff; border:none; padding: 9px 18px; font-size:13px; font-weight:600; color: var(--muted); border-right:1px solid var(--line-strong); }
.lt-segment button:last-child { border-right:none; }
.lt-segment button.active { background: var(--accent-tint); color: var(--accent-dark); }
.lt-segment button:hover:not(.active) { background: #FAFAF8; color: var(--text); }
.setup-row { display:flex; align-items:flex-start; justify-content:space-between; gap: 40px; margin-bottom: 22px; flex-wrap:wrap; }
.setup-row > div { flex: 1; min-width: 220px; }
.setup-label { font-size:12.5px; font-weight:600; color: var(--ink-soft); margin-bottom:9px; }

/* ---------- Dispatch console ---------- */
.lt-dispatch-progress { background: #FAFAF8; border:1px solid var(--line); border-radius:8px; padding: 16px 18px; margin-top: 8px; }
.lt-dispatch-progress-label { font-size:13px; font-weight:600; color: var(--ink-soft); display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.lt-dispatch-progress-label .dot { width:8px; height:8px; border-radius:50%; background: var(--accent); flex-shrink:0; }
.lt-progress-track { width:100%; height:9px; background:#E1E3DE; border-radius:6px; overflow:hidden; }
.lt-progress-fill { height:100%; background: var(--accent); border-radius:6px; transition: width .3s ease; }
.lt-sidebar-foot { padding: 14px 22px 18px; border-top: 1px solid rgba(255,255,255,.08); font-size: 11px; color: #66738C; }

.lt-main { flex: 1; min-width: 0; display:flex; flex-direction:column; }
.lt-header {
  height: 62px; background: var(--surface); border-bottom: 1px solid var(--line);
  display:flex; align-items:center; justify-content:space-between; padding: 0 28px; position:sticky; top:0; z-index:20;
}
.lt-header-title { font-size: 16px; font-weight: 700; color: var(--ink-soft); }
.lt-header-crumb { font-size: 12px; color: var(--faint); margin-top:1px; }
.lt-profile { display:flex; align-items:center; gap:10px; position:relative; }
.lt-role-pill { font-size:11px; font-weight:600; padding:4px 10px; border-radius: 20px; background: var(--accent-tint); color: var(--accent-dark); text-transform:capitalize; }
.lt-avatar { width:32px; height:32px; border-radius:50%; background: var(--ink); color:#fff; display:flex; align-items:center; justify-content:center; font-size:12.5px; font-weight:700; }
.lt-menu-btn { display:flex; align-items:center; gap:8px; background:transparent; border:1px solid transparent; padding:5px 8px; border-radius:7px; }
.lt-menu-btn:hover { background: var(--paper); }
.lt-dropdown { position:absolute; top: 46px; right:0; background:#fff; border:1px solid var(--line); border-radius:8px; box-shadow: 0 10px 30px rgba(16,28,52,.14); min-width:190px; padding:6px; z-index:30; }
.lt-dropdown-item { display:flex; align-items:center; gap:9px; width:100%; padding:9px 10px; font-size:13px; border-radius:6px; background:transparent; border:none; text-align:left; color:var(--text); }
.lt-dropdown-item:hover { background: var(--paper); }
.lt-dropdown-item.danger { color: var(--red); }

.lt-content { padding: 28px 32px 60px; flex:1; }
.lt-page-head { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom: 22px; gap: 16px; flex-wrap:wrap; }
.lt-page-eyebrow { font-size:12px; color: var(--faint); font-weight:600; margin-bottom:4px; }
.lt-page-title { font-size: 22px; font-weight:700; color: var(--ink-soft); }
.lt-page-desc { font-size: 13px; color: var(--muted); margin-top:4px; max-width:560px; }

/* ---------- Cards / stats ---------- */
.lt-grid { display:grid; gap: 14px; }
.lt-stat-grid { grid-template-columns: repeat(auto-fit, minmax(148px,1fr)); margin-bottom: 20px; }
.lt-card { background: var(--surface); border:1px solid var(--line); border-radius: 8px; }
.lt-stat { padding: 16px 16px; }
.lt-stat-label { font-size:11.5px; color: var(--muted); font-weight:600; margin-bottom:8px; }
.lt-stat-value { font-size: 26px; font-weight:700; color: var(--ink-soft); line-height:1; }
.lt-stat-flag .lt-stat-value { color: var(--amber); }
.lt-stat-recalled .lt-stat-value { color: var(--red); }
.lt-panel { padding: 20px 22px; }
.lt-panel-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.lt-panel-title { font-size: 14px; font-weight:700; color: var(--ink-soft); display:flex; align-items:center; gap:8px; }

/* ---------- Tables ---------- */
.lt-table-wrap { overflow-x:auto; }
table.lt-table { width:100%; border-collapse: collapse; font-size: 13px; }
table.lt-table thead th {
  text-align:left; padding: 10px 14px; font-size:11px; font-weight:600; color: var(--muted);
  border-bottom: 1px solid var(--line); white-space:nowrap; background: #FAFAF8;
}
table.lt-table tbody td { padding: 12px 14px; border-bottom: 1px solid var(--line); vertical-align:middle; color: var(--text); }
table.lt-table tbody tr:last-child td { border-bottom:none; }
table.lt-table tbody tr:hover { background: #FBFBFA; }
.lt-row-link { color: var(--accent-dark); font-weight:600; background:none; border:none; padding:0; font-size:13px; }
.lt-row-link:hover { text-decoration: underline; }

/* ---------- Badges ---------- */
.badge { display:inline-flex; align-items:center; gap:6px; padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight:600; white-space:nowrap; }
.badge .dot { width:6px; height:6px; border-radius:50%; }
.badge-active { background: var(--green-tint); color: var(--green); }
.badge-active .dot { background: var(--green); }
.badge-expired { background: var(--grey-tint); color: var(--grey); }
.badge-expired .dot { background: var(--grey); }
.badge-recalled { background: var(--red-tint); color: var(--red); }
.badge-recalled .dot { background: var(--red); }
.badge-expiring { background: var(--amber-tint); color: var(--amber); }
.badge-expiring .dot { background: var(--amber); }
.badge-inproduction { background: #E4EEFB; color: #1D5FA8; }
.badge-inproduction .dot { background: #1D5FA8; }
.badge-pending { background: var(--amber-tint); color: var(--amber); }
.badge-pending .dot { background: var(--amber); }
.badge-approved { background: var(--green-tint); color: var(--green); }
.badge-approved .dot { background: var(--green); }
.badge-rejected { background: var(--red-tint); color: var(--red); }
.badge-rejected .dot { background: var(--red); }

/* ---------- Forms ---------- */
.field { margin-bottom: 16px; }
.field label { display:block; font-size: 12.5px; font-weight:600; color: var(--ink-soft); margin-bottom:6px; }
.field .hint { font-size: 11.5px; color: var(--faint); margin-top:5px; }
.field .err { font-size: 11.5px; color: var(--red); margin-top:5px; font-weight:600; }
.input, select.input, textarea.input {
  width:100%; padding: 9px 12px; border:1px solid var(--line-strong); border-radius:5px; font-size: 13.5px;
  color: var(--text); background:#fff; outline:none; transition: border-color .12s;
}
.input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-tint); }
.input:disabled { background: #F2F2F0; color: var(--muted); }
.input-icon-wrap { position:relative; }
.input-icon-wrap .input { padding-right: 40px; }
.input-icon-btn { position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--faint); padding:4px; }
.form-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
.form-grid .full { grid-column: 1 / -1; }
.filters-bar { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; align-items:center; }
.filters-bar .input { width: auto; min-width:150px; }

/* ---------- Access permissions tree ---------- */
.lt-perm-tree { border:1px solid var(--line); border-radius:6px; background:#FAFAF8; padding: 2px 14px; }
.lt-perm-node { padding: 9px 0; border-bottom: 1px solid var(--line); }
.lt-perm-node:last-child { border-bottom: none; }
.lt-perm-row { display:flex; align-items:center; gap:9px; font-size:13px; color: var(--text); font-weight:500; cursor:pointer; }
.lt-perm-row input[type="checkbox"] { width:14px; height:14px; accent-color: var(--accent); flex-shrink:0; cursor:pointer; }
.lt-perm-children { margin: 7px 0 1px 23px; display:flex; flex-direction:column; gap:7px; }
.lt-perm-sub { font-size:12.5px; color: var(--muted); font-weight:500; }
.lt-perm-disabled { opacity: .45; cursor: not-allowed; }
.lt-perm-disabled input[type="checkbox"] { cursor: not-allowed; }
.lt-perm-locked { display:flex; align-items:center; gap:9px; font-size:13px; color: var(--faint); padding: 9px 0; }

/* ---------- Modal ---------- */
.lt-overlay { position:fixed; inset:0; background: rgba(16,20,30,.5); display:flex; align-items:center; justify-content:center; z-index:100; padding: 20px; }
.lt-modal { background:#fff; border-radius:10px; width: 460px; max-width:100%; box-shadow: 0 24px 60px rgba(10,15,25,.3); }
.lt-modal-head { padding: 18px 22px; border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; }
.lt-modal-title { font-size:15px; font-weight:700; color:var(--ink-soft); }
.lt-modal-body { padding: 20px 22px; }
.lt-modal-foot { padding: 16px 22px; border-top:1px solid var(--line); display:flex; justify-content:flex-end; gap:10px; }
.lt-icon-btn { background:none; border:none; color:var(--faint); padding:4px; border-radius:5px; }
.lt-icon-btn:hover { background: var(--paper); color: var(--text); }

/* ---------- Toast ---------- */
.lt-toast { position:fixed; bottom: 24px; right: 24px; background: var(--ink); color:#fff; padding: 13px 18px; border-radius:8px; font-size:13.5px; display:flex; align-items:center; gap:10px; box-shadow: 0 12px 30px rgba(0,0,0,.25); z-index:200; }
.lt-toast.ok { border-left: 3px solid var(--green); }
.lt-toast.err { border-left: 3px solid var(--red); }

/* ---------- Empty / job states ---------- */
.lt-empty { text-align:center; padding: 46px 20px; color: var(--muted); }
.lt-empty svg { color: var(--faint); margin-bottom:10px; }
.lt-empty-title { font-weight:600; color: var(--ink-soft); font-size:14px; margin-bottom:4px; }
.lt-empty-desc { font-size:12.5px; max-width:340px; margin: 0 auto; }

/* ---------- Anomaly / alert rows ---------- */
.lt-alert-row { display:flex; align-items:flex-start; gap:12px; padding: 12px 0; border-bottom:1px solid var(--line); }
.lt-alert-row:last-child { border-bottom:none; }
.lt-alert-icon { width:30px; height:30px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.lt-alert-text { font-size:13px; color: var(--text); line-height:1.45; }
.lt-alert-batch { font-weight:700; color: var(--ink-soft); }
.lt-alert-link { font-size:12px; font-weight:600; color: var(--accent-dark); background:none; border:none; padding:0; margin-top:3px; }

/* ---------- Auth / public pages ---------- */
.lt-auth-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background: var(--ink);
  background-image: radial-gradient(circle at 15% 20%, rgba(14,124,116,.35), transparent 40%), radial-gradient(circle at 85% 80%, rgba(14,124,116,.2), transparent 45%); }
.lt-auth-card { width: 400px; max-width:92vw; background:#fff; border-radius: 12px; padding: 34px 32px; box-shadow: 0 30px 70px rgba(0,0,0,.35); }
.lt-auth-brand { display:flex; align-items:center; gap:11px; margin-bottom: 26px; }
.lt-auth-title { font-size:19px; font-weight:700; color:var(--ink-soft); margin-bottom:5px; }
.lt-auth-desc { font-size:12.5px; color:var(--muted); margin-bottom: 24px; }
.lt-demo-row { display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top: 6px; }
.lt-demo-btn { border:1px solid var(--line-strong); background:#fff; border-radius:6px; padding:9px 8px; font-size:11.5px; font-weight:600; color:var(--ink-soft); text-align:left; }
.lt-demo-btn:hover { border-color:var(--accent); background: var(--accent-tint); }
.lt-demo-btn .r { display:block; font-size:10px; color:var(--faint); font-weight:500; margin-top:1px; }

.lt-verify-wrap { min-height:100vh; background: #0E1B24; background-image: radial-gradient(circle at 20% 0%, rgba(14,124,116,.18), transparent 45%); display:flex; flex-direction:column; align-items:center; padding: 0 0 60px; }
.lt-verify-shell { max-width: 480px; width:100%; margin: 0 auto; padding: 0 18px 0; }
.lt-verify-topbar { display:flex; align-items:center; padding: 16px 4px 6px; }
.lt-verify-topbar .btn-ghost { color:#9FB0C4; }
.lt-verify-topbar .btn-ghost:hover { background: rgba(255,255,255,.08); color:#fff; }

.lt-verify-codebox { border:1px solid rgba(255,255,255,.14); border-radius:10px; padding: 14px 16px; margin: 6px 0 18px; background: rgba(255,255,255,.03); }
.lt-verify-codebox label { display:block; font-size:11.5px; font-weight:600; color:#9FB0C4; margin-bottom:8px; }
.lt-verify-codebox .input { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.18); color:#fff; }
.lt-verify-codebox .input::placeholder { color:#6E7E93; }
.lt-verify-codebox .input:focus { border-color: var(--accent); box-shadow:0 0 0 3px rgba(14,124,116,.25); }
.lt-verify-codehint { font-size:11px; color:#6E7E93; margin-top:9px; line-height:1.5; }

.lt-tab-row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom: 22px; }
.lt-tab { font-size:12px; font-weight:600; padding:8px 14px; border-radius:20px; border:1px solid rgba(94,190,178,.4); background:transparent; color:#7FD6C7; }
.lt-tab.active { background: var(--accent); color:#fff; border-color: var(--accent); }
.lt-tab:hover:not(.active) { background: rgba(14,124,116,.15); }

.lt-verify-card { position:relative; background:#fff; border-radius: 18px; padding: 40px 26px 26px; box-shadow: 0 30px 60px rgba(0,0,0,.35); text-align:center; }
.lt-verify-card::before {
  content:""; position:absolute; top:-13px; left:50%; transform:translateX(-50%);
  width:64px; height:26px; background: #0E1B24; border-radius: 0 0 24px 24px;
}
.lt-verify-icon { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 16px; }
.lt-verify-icon.ok { background: var(--green-tint); color: var(--green); }
.lt-verify-icon.warn { background: var(--amber-tint); color: var(--amber); }
.lt-verify-icon.bad { background: var(--red-tint); color: var(--red); }
.lt-verify-icon.flat { background: var(--grey-tint); color: var(--grey); }
.lt-verify-title { font-size:19px; font-weight:700; color: var(--ink-soft); margin-bottom:6px; }
.lt-verify-sub { font-size:13px; color: var(--muted); max-width:340px; margin: 0 auto 24px; line-height:1.5; }
.lt-verify-card .kv-row { text-align:left; }
.lt-verify-note { background: var(--amber-tint); color:#8A5B0B; border-radius:8px; padding: 13px 15px; font-size:12.5px; line-height:1.55; text-align:left; margin-top:18px; }
.lt-verify-report { width:100%; justify-content:center; margin-top:22px; background: var(--red-tint); color: var(--red); border-color: var(--red-tint); font-weight:700; }
.lt-verify-report:hover { background: #F5D3CE; }

.kv-row { display:flex; justify-content:space-between; padding: 8px 0; border-bottom:1px solid var(--line); font-size:13px; }
.kv-row:last-child { border-bottom:none; }
.kv-label { color: var(--muted); }
.kv-val { font-weight:600; color:var(--ink-soft); text-align:right; }

.lt-access-denied { min-height:100vh; display:flex; align-items:center; justify-content:center; background: var(--paper); text-align:center; padding:20px; }

/* section headers within detail views */
.detail-section { margin-bottom: 18px; }
.detail-section-title { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.4px; color: var(--faint); margin-bottom:10px; }

/* segmented control (Setup page) */
.segmented { display:flex; border:1px solid var(--line-strong); border-radius:6px; overflow:hidden; }
.segmented button { flex:1; padding: 10px 14px; background:#fff; border:none; border-right:1px solid var(--line-strong); font-size:13px; font-weight:600; color:var(--muted); }
.segmented button:last-child { border-right:none; }
.segmented button:hover { background: var(--paper); }
.segmented button.active { background: var(--accent-tint); color: var(--accent-dark); }
.setup-note { font-size:12.5px; color: var(--muted); line-height:1.5; margin: 14px 0 18px; }
.setup-card-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
.setup-card-eyebrow { font-size:11px; color: var(--faint); font-weight:600; }

@media (max-width: 880px) {
  .lt-sidebar { display:none; }
  .form-grid { grid-template-columns: 1fr; }
}
`;

/* ============================================================
   MOCK DATA
   ============================================================ */
const MANUFACTURERS = [
  { id: "MFR-01", name: "Kaveri Lubricants Pvt Ltd", defaultShelfLife: "36 Months", products: 4, plants: "Pune, Nagpur" },
  { id: "MFR-02", name: "Anveshan Industrial Fluids", defaultShelfLife: "24 Months", products: 3, plants: "Vadodara" },
  { id: "MFR-03", name: "Bharat PetroChem Co.", defaultShelfLife: "48 Months", products: 2, plants: "Vizag" },
];

const PRODUCTS = [
  { id: "PRD-1042", name: "SynthoShield 20W-40 Engine Oil", category: "Engine Oil", manufacturer: "Kaveri Lubricants Pvt Ltd", desc: "Fully synthetic 4-stroke engine oil for commercial fleets.", shelfLife: "Product default (24 Months)", mfgDate: "01 Sep 2026", expiryDate: "01 Sep 2028", updated: "28 Aug 2026" },
  { id: "PRD-1043", name: "SynthoShield 15W-50 Engine Oil", category: "Engine Oil", manufacturer: "Kaveri Lubricants Pvt Ltd", desc: "High-performance synthetic blend for two-wheelers.", shelfLife: "Manufacturer default (36 Months)", mfgDate: "22 Aug 2026", expiryDate: "22 Aug 2029", updated: "20 Aug 2026" },
  { id: "PRD-1108", name: "HydroMax Hydraulic Fluid ISO 68", category: "Hydraulic Fluid", manufacturer: "Anveshan Industrial Fluids", desc: "Anti-wear hydraulic fluid for industrial machinery.", shelfLife: "Manufacturer default (24 Months)", mfgDate: "10 Aug 2026", expiryDate: "10 Aug 2028", updated: "14 Aug 2026" },
  { id: "PRD-1122", name: "TransGuard Gear Oil 90", category: "Gear Oil", manufacturer: "Kaveri Lubricants Pvt Ltd", desc: "EP gear oil for heavy commercial axles.", shelfLife: "Product default (18 Months)", mfgDate: "02 Feb 2025", expiryDate: "02 Aug 2026", updated: "02 Aug 2026" },
  { id: "PRD-1201", name: "CoolFlow Radiator Coolant", category: "Coolant", manufacturer: "Bharat PetroChem Co.", desc: "Long-life ethylene-glycol based coolant concentrate.", shelfLife: "Manufacturer default (48 Months)", mfgDate: "18 Jul 2026", expiryDate: "18 Jul 2030", updated: "26 Jul 2026" },
];

const BATCHES = [
  { batch: "B-2026-0817", productId: "PRD-1042", productName: "SynthoShield 20W-40 Engine Oil", manufacturer: "Kaveri Lubricants Pvt Ltd", mfg: "01 Sep 2026", expiry: "01 Sep 2028", qty: 12000, status: "ACTIVE", created: "01 Sep 2026" },
  { batch: "B-2026-0790", productId: "PRD-1043", productName: "SynthoShield 15W-50 Engine Oil", manufacturer: "Kaveri Lubricants Pvt Ltd", mfg: "22 Aug 2026", expiry: "22 Aug 2029", qty: 8500, status: "ACTIVE", created: "22 Aug 2026", anomaly: true },
  { batch: "B-2026-0754", productId: "PRD-1108", productName: "HydroMax Hydraulic Fluid ISO 68", manufacturer: "Anveshan Industrial Fluids", mfg: "10 Aug 2026", expiry: "10 Aug 2028", qty: 4200, status: "RECALLED", created: "10 Aug 2026" },
  { batch: "B-2026-0700", productId: "PRD-1122", productName: "TransGuard Gear Oil 90", manufacturer: "Kaveri Lubricants Pvt Ltd", mfg: "02 Feb 2025", expiry: "02 Aug 2026", qty: 6000, status: "EXPIRED", created: "02 Feb 2025" },
  { batch: "B-2026-0655", productId: "PRD-1201", productName: "CoolFlow Radiator Coolant", manufacturer: "Bharat PetroChem Co.", mfg: "18 Jul 2026", expiry: "18 Jul 2030", qty: 15000, status: "ACTIVE", created: "18 Jul 2026" },
  { batch: "B-2026-0611", productId: "PRD-1042", productName: "SynthoShield 20W-40 Engine Oil", manufacturer: "Kaveri Lubricants Pvt Ltd", mfg: "05 Jul 2026", expiry: "05 Oct 2026", qty: 3000, status: "ACTIVE", created: "05 Jul 2026", expiringSoon: true },
  { batch: "B-2026-0860", productId: "PRD-1043", productName: "SynthoShield 15W-50 Engine Oil", manufacturer: "Kaveri Lubricants Pvt Ltd", mfg: "—", expiry: "—", qty: 5000, status: "IN PRODUCTION", created: "02 Sep 2026" },
];

const RECALLS = [
  { batch: "B-2026-0754", productId: "PRD-1108", productName: "HydroMax Hydraulic Fluid ISO 68", manufacturer: "Anveshan Industrial Fluids", reason: "Viscosity out of spec detected in QA retest of retained sample.", recalledBy: "R. Deshmukh (Admin)", date: "29 Aug 2026, 11:20", status: "RECALLED" },
];

const ANOMALIES = [
  { batch: "B-2026-0790", productName: "SynthoShield 15W-50 Engine Oil", text: "Same token scanned in Pune and Chennai within 40 minutes — possible clone.", severity: "high" },
  { batch: "B-2026-0655", productName: "CoolFlow Radiator Coolant", text: "Token scanned 14 times in one week — well above expected rate for its generation level.", severity: "medium" },
  { batch: "B-2026-0817", productName: "SynthoShield 20W-40 Engine Oil", text: "Batch is scanning at roughly 3x the rate of comparable batches this month.", severity: "medium" },
  { batch: "B-2026-0611", productName: "SynthoShield 20W-40 Engine Oil", text: "Same token scanned twice nine minutes apart from IP addresses in different states.", severity: "high" },
  { batch: "B-2026-0754", productName: "HydroMax Hydraulic Fluid ISO 68", text: "Scans continued for 48 hours after this batch was recalled.", severity: "high" },
];

/* ------------------------------------------------------------
   Access permissions — which pages a user's sidebar can show.
   "setup" is intentionally absent: it is never assignable and is
   only ever shown to the Admin role.
   ------------------------------------------------------------ */
const PERMISSION_TREE = [
  { key: "dashboard", label: "Dashboard" },
  { key: "products", label: "Products", children: [
    { key: "products.add", label: "Add product" },
    { key: "products.edit", label: "Edit product" },
  ] },
  { key: "labelGeneration", label: "Label Generation" },
  { key: "dispatchConsole", label: "Dispatch Console" },
  { key: "batches", label: "Batch Management", children: [
    { key: "batches.view", label: "View only" },
    { key: "batches.recall", label: "Recall" },
  ] },
  { key: "recalls", label: "Recall Management" },
  { key: "csvDownloads", label: "CSV Downloads" },
  { key: "csvRequests", label: "Redownload Requests" },
  { key: "users", label: "Users" },
];

const ROLE_DEFAULT_PERMISSIONS = {
  Admin: ["dashboard", "products", "products.add", "products.edit", "labelGeneration", "dispatchConsole", "batches", "batches.view", "batches.recall", "recalls", "csvDownloads", "csvRequests", "users"],
  Manufacturer: ["dashboard", "products", "products.add", "products.edit", "labelGeneration", "dispatchConsole", "batches", "batches.view", "batches.recall", "recalls", "csvDownloads", "users"],
  "Dispatch Agent": ["dispatchConsole", "batches", "batches.view"],
  "Label Manufacturer": ["csvDownloads"],
  Employee: ["products", "csvDownloads"],
};

// Maps the 4 demo login roles to a representative account in USERS, so the
// "Preview as a role" login shows sidebar changes made to that account.
const ROLE_DEMO_USER_ID = { admin: "U-001", manufacturer: "U-002", labelmfr: "U-003", employee: "U-004" };

// Role is a free-typed field on the user record; this maps whatever was typed
// to the internal system role LabelTrack uses for data scoping (e.g. which
// batches a Manufacturer sees) and for the Admin-only Setup check. Anything
// unrecognized (custom titles, "Dispatch Agent", etc.) falls back to the most
// restricted baseline — the sidebar itself is still governed purely by the
// selected permission checkboxes, not by this mapping.
function normalizeRole(roleText) {
  const t = (roleText || "").trim().toLowerCase();
  if (t === "admin") return "admin";
  if (t === "manufacturer") return "manufacturer";
  if (t === "label manufacturer") return "labelmfr";
  if (t === "employee") return "employee";
  return "employee";
}

const USERS = [
  { id: "U-001", name: "Rhea Deshmukh", email: "rhea.deshmukh@labeltrack.com", role: "Admin", manufacturer: "—", status: "Active", password: "Demo@123", permissions: ROLE_DEFAULT_PERMISSIONS.Admin },
  { id: "U-002", name: "Arjun Patwardhan", email: "arjun.p@kaverilube.com", role: "Manufacturer", manufacturer: "Kaveri Lubricants Pvt Ltd", status: "Active", password: "Demo@123", permissions: ROLE_DEFAULT_PERMISSIONS.Manufacturer },
  { id: "U-003", name: "Sneha Kulkarni", email: "sneha.k@labelworks.in", role: "Label Manufacturer", manufacturer: "—", status: "Active", password: "Demo@123", permissions: ROLE_DEFAULT_PERMISSIONS["Label Manufacturer"] },
  { id: "U-004", name: "Manoj Iyer", email: "manoj.iyer@kaverilube.com", role: "Employee", manufacturer: "Kaveri Lubricants Pvt Ltd", status: "Inactive", password: "Demo@123", permissions: ROLE_DEFAULT_PERMISSIONS.Employee },
  { id: "U-005", name: "Farah Sheikh", email: "farah.sheikh@anveshan.in", role: "Manufacturer", manufacturer: "Anveshan Industrial Fluids", status: "Active", password: "Demo@123", permissions: ROLE_DEFAULT_PERMISSIONS.Manufacturer },
  { id: "U-006", name: "Vikram Rao", email: "vikram.rao@kaverilube.com", role: "Dispatch Agent", manufacturer: "Kaveri Lubricants Pvt Ltd", status: "Active", password: "Demo@123", permissions: ROLE_DEFAULT_PERMISSIONS["Dispatch Agent"] },
];

const CSV_RECORDS = [
  { id: 1, batch: "B-2026-0817", productId: "PRD-1042", manufacturer: "Kaveri Lubricants Pvt Ltd", date: "01 Sep 2026", status: "ACTIVE", firstDownload: true },
  { id: 2, batch: "B-2026-0790", productId: "PRD-1043", manufacturer: "Kaveri Lubricants Pvt Ltd", date: "22 Aug 2026", status: "ACTIVE", firstDownload: false },
  { id: 3, batch: "B-2026-0754", productId: "PRD-1108", manufacturer: "Anveshan Industrial Fluids", date: "10 Aug 2026", status: "RECALLED", firstDownload: false },
  { id: 4, batch: "B-2026-0700", productId: "PRD-1122", manufacturer: "Kaveri Lubricants Pvt Ltd", date: "02 Feb 2025", status: "EXPIRED", firstDownload: false },
];

const REDOWNLOAD_REQUESTS = [
  { id: "RR-118", requestedBy: "Sneha Kulkarni", role: "Label Manufacturer", batch: "B-2026-0790", reason: "Original export corrupted during transfer to print vendor.", date: "31 Aug 2026", status: "Pending" },
  { id: "RR-117", requestedBy: "Manoj Iyer", role: "Employee", batch: "B-2026-0700", reason: "Needed for a closed batch's compliance audit.", date: "27 Aug 2026", status: "Approved" },
  { id: "RR-116", requestedBy: "Farah Sheikh", role: "Manufacturer", batch: "B-2026-0754", reason: "Re-verifying recalled batch codes against distributor returns.", date: "25 Aug 2026", status: "Rejected" },
];

const BATCH_STATUS_BAR = [
  { name: "Active", v: 214 }, { name: "In Production", v: 42 }, { name: "Expired", v: 38 }, { name: "Recalled", v: 6 },
];

const NAV_CONFIG = {
  admin: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
    { key: "products", label: "Products", icon: Package, section: "Operate" },
    { key: "labelGeneration", label: "Label Generation", icon: QrCode, section: "Operate" },
    { key: "dispatchConsole", label: "Dispatch Console", icon: Truck, section: "Operate" },
    { key: "batches", label: "Batch Management", icon: Boxes, section: "Operate" },
    { key: "recalls", label: "Recall Management", icon: AlertTriangle, section: "Operate" },
    { key: "csvDownloads", label: "CSV Downloads", icon: Download, section: "Operate" },
    { key: "csvRequests", label: "Redownload Requests", icon: ClipboardList, section: "Operate" },
    { key: "users", label: "Users", icon: UsersIcon, section: "Admin only" },
    { key: "setup", label: "Setup", icon: Settings, section: "Admin only" },
  ],
  manufacturer: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "products", label: "Products", icon: Package },
    { key: "labelGeneration", label: "Label Generation", icon: QrCode },
    { key: "dispatchConsole", label: "Dispatch Console", icon: Truck },
    { key: "batches", label: "Batch Management", icon: Boxes },
    { key: "recalls", label: "Recall Management", icon: AlertTriangle },
    { key: "csvDownloads", label: "CSV Downloads", icon: Download },
    { key: "users", label: "Users", icon: UsersIcon },
  ],
  labelmfr: [
    { key: "csvDownloads", label: "CSV Downloads", icon: Download },
  ],
  employee: [
    { key: "products", label: "Products", icon: Package },
    { key: "csvDownloads", label: "CSV Downloads", icon: Download },
  ],
};

const LANDING = { admin: "dashboard", manufacturer: "dashboard", labelmfr: "csvDownloads", employee: "products" };
const ROLE_LABEL = { admin: "Admin", manufacturer: "Manufacturer", labelmfr: "Label Manufacturer", employee: "Employee" };
const ROLE_ALLOWED = {
  dashboard: ["admin", "manufacturer"],
  users: ["admin", "manufacturer"], userAdd: ["admin", "manufacturer"], setup: ["admin"],
  products: ["admin", "manufacturer", "employee"], productDetail: ["admin", "manufacturer", "employee"],
  labelGeneration: ["admin", "manufacturer"],
  dispatchConsole: ["admin", "manufacturer"],
  batches: ["admin", "manufacturer"], batchDetail: ["admin", "manufacturer"],
  recalls: ["admin", "manufacturer"],
  csvDownloads: ["admin", "manufacturer", "labelmfr", "employee"],
  csvRequests: ["admin"],
};

/* ============================================================
   SMALL SHARED COMPONENTS
   ============================================================ */
function Badge({ status }) {
  const map = {
    ACTIVE: ["badge-active", "Active"],
    EXPIRED: ["badge-expired", "Expired"],
    RECALLED: ["badge-recalled", "Recalled"],
    "EXPIRING SOON": ["badge-expiring", "Expiring soon"],
    "IN PRODUCTION": ["badge-inproduction", "In Production"],
    Pending: ["badge-pending", "Pending"],
    Approved: ["badge-approved", "Approved"],
    Rejected: ["badge-rejected", "Rejected"],
    Active: ["badge-active", "Active"],
    Inactive: ["badge-expired", "Inactive"],
  };
  const [cls, text] = map[status] || ["badge-expired", status];
  return <span className={`badge ${cls}`}><span className="dot" /> {text}</span>;
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`lt-card lt-stat ${tone ? "lt-stat-" + tone : ""}`}>
      <div className="lt-stat-label">{label}</div>
      <div className="lt-stat-value">{value}</div>
    </div>
  );
}

function PageHead({ eyebrow, title, desc, action }) {
  return (
    <div className="lt-page-head">
      <div>
        {eyebrow && <div className="lt-page-eyebrow">{eyebrow}</div>}
        <div className="lt-page-title">{title}</div>
        {desc && <div className="lt-page-desc">{desc}</div>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="lt-empty">
      <Icon size={30} strokeWidth={1.5} />
      <div className="lt-empty-title">{title}</div>
      <div className="lt-empty-desc">{desc}</div>
    </div>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint && !error && <div className="hint">{hint}</div>}
      {error && <div className="err">{error}</div>}
    </div>
  );
}

function PermissionsField({ selected, onChange }) {
  function toggleParent(node) {
    if (selected.includes(node.key)) {
      const childKeys = (node.children || []).map(c => c.key);
      onChange(selected.filter(k => k !== node.key && !childKeys.includes(k)));
    } else {
      onChange([...selected, node.key]);
    }
  }
  function toggleChild(key) {
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);
  }
  return (
    <Field label="Access permissions" hint="Controls which pages appear in this user's sidebar. Sub-options need their page checked first.">
      <div className="lt-perm-tree">
        {PERMISSION_TREE.map(node => {
          const parentChecked = selected.includes(node.key);
          return (
            <div className="lt-perm-node" key={node.key}>
              <label className="lt-perm-row">
                <input type="checkbox" checked={parentChecked} onChange={() => toggleParent(node)} />
                <span>{node.label}</span>
              </label>
              {node.children && (
                <div className="lt-perm-children">
                  {node.children.map(child => (
                    <label className={`lt-perm-row lt-perm-sub ${!parentChecked ? "lt-perm-disabled" : ""}`} key={child.key}>
                      <input type="checkbox" checked={selected.includes(child.key)} disabled={!parentChecked} onChange={() => toggleChild(child.key)} />
                      <span>{child.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="lt-perm-locked">
          <ShieldCheck size={14} /> Setup — Admin only, not assignable here
        </div>
      </div>
    </Field>
  );
}

function Modal({ title, onClose, children, footer, width }) {
  return (
    <div className="lt-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lt-modal" style={width ? { width } : undefined}>
        <div className="lt-modal-head">
          <div className="lt-modal-title">{title}</div>
          <button className="lt-icon-btn" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="lt-modal-body">{children}</div>
        {footer && <div className="lt-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`lt-toast ${toast.type || "ok"}`}>
      {toast.type === "err" ? <XCircle size={16} /> : <CheckCircle2 size={16} />} {toast.msg}
    </div>
  );
}

/* ============================================================
   AUTH / LOGIN
   ============================================================ */
function LoginPage({ onLogin, onViewVerify, users }) {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!email || !pw) { setError("Enter your email and password to continue."); return; }
    const match = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === pw);
    if (!match) { setError("Invalid email or password."); return; }
    if (match.status === "Inactive") { setError("This account is inactive. Contact your Admin."); return; }
    setError("");
    onLogin(match);
  }

  return (
    <div className="lt-auth-wrap">
      <div className="lt-auth-card">
        <div className="lt-auth-brand">
          <div className="lt-brand-mark" style={{ background: "#0E7C74" }}><QrCode size={17} /></div>
          <div>
            <div className="lt-brand-name" style={{ color: "#182233" }}>LabelTrack</div>
            <div className="lt-brand-sub" style={{ color: "#8A8F97" }}>Label Generation &amp; Batch Management</div>
          </div>
        </div>
        <div className="lt-auth-title">Sign in to your account</div>
        <div className="lt-auth-desc">Use your registered work email. Your sidebar shows the pages your account was granted.</div>

        <form onSubmit={submit}>
          <Field label="Username or email">
            <input className="input" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          </Field>
          <Field label="Password" error={error}>
            <div className="input-icon-wrap">
              <input className="input" type={showPw ? "text" : "password"} placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} />
              <button type="button" className="input-icon-btn" onClick={() => setShowPw(s => !s)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 12.5, color: "#0A5E58", fontWeight: 600, textDecoration: "none" }}>Forgot password?</a>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px 16px" }} type="submit">
            Sign in
          </button>
        </form>

        <div style={{ margin: "22px 0 6px", borderTop: "1px solid #E1E3DE", paddingTop: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "#8A8F97", marginBottom: 8 }}>PREVIEW AS A ROLE</div>
          <div className="lt-demo-row">
            {Object.keys(ROLE_LABEL).map(r => (
              <button key={r} className="lt-demo-btn" onClick={() => onLogin(r)}>
                {ROLE_LABEL[r]}
                <span className="r">{r === "admin" ? "Full access" : r === "manufacturer" ? "Scoped to own data" : r === "labelmfr" ? "Generation + search only" : "Downloads only"}</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#8A8F97", marginTop: 10 }}>Every seeded account signs in with the password <span className="lt-mono">Demo@123</span>.</div>
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button onClick={onViewVerify} style={{ background: "none", border: "none", fontSize: 12, color: "#5C6572", fontWeight: 500 }}>
            Scanning a product? View the public verification page →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ACCESS DENIED
   ============================================================ */
function AccessDenied({ onBack }) {
  return (
    <div className="lt-access-denied">
      <div>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FAE7E4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <ShieldX size={28} color="#B0362B" />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#182233", marginBottom: 8 }}>403 — Access denied</div>
        <div style={{ fontSize: 13.5, color: "#5C6572", maxWidth: 360, margin: "0 auto 22px" }}>
          Your role doesn't have permission to view this page. If you believe this is a mistake, contact your Admin.
        </div>
        <button className="btn btn-primary" onClick={onBack}>Return to your dashboard</button>
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function Dashboard({ role, goTo }) {
  const scoped = role === "manufacturer";
  const activeAnomalies = ANOMALIES.filter(a => { const b = BATCHES.find(x => x.batch === a.batch); return b && b.status === "ACTIVE"; });
  const topBatches = [...new Set(activeAnomalies.map(a => a.batch))].slice(0, 5);
  const topProducts = [...new Set(activeAnomalies.map(a => a.productName))].slice(0, 5);
  const inProductionCount = BATCHES.filter(b => b.status === "IN PRODUCTION" && (!scoped || b.manufacturer === "Kaveri Lubricants Pvt Ltd")).length;

  return (
    <>
      <PageHead
        eyebrow={scoped ? "Kaveri Lubricants Pvt Ltd" : "System-wide"}
        title="Dashboard"
        desc={scoped ? "Figures scoped to your manufacturer account." : "Live figures across every manufacturer on the platform."}
      />
      <div className="lt-grid lt-stat-grid" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
        <StatCard label="Total products" value={scoped ? "4" : "5"} />
        <StatCard label="Total batches" value={scoped ? "4" : "6"} />
        <StatCard label="In Production batches" value={inProductionCount} />
        <StatCard label="Active batches" value={scoped ? "3" : "4"} />
        <StatCard label="Recalled batches" value={scoped ? "0" : "1"} tone="recalled" />
        <StatCard label="Expired batches" value={scoped ? "1" : "1"} />
      </div>

      <div className="lt-grid" style={{ marginBottom: 20 }}>
        <div className="lt-card lt-panel">
          <div className="lt-panel-head"><div className="lt-panel-title">Batch status overview</div></div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BATCH_STATUS_BAR} margin={{ left: -18, top: 4, right: 8 }}>
                <CartesianGrid stroke="#E1E3DE" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8A8F97" }} axisLine={{ stroke: "#E1E3DE" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8A8F97" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E1E3DE" }} />
                <Bar dataKey="v" fill="#0E7C74" radius={[4, 4, 0, 0]} name="Batches" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="lt-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="lt-card lt-panel">
          <div className="lt-panel-head">
            <div className="lt-panel-title"><AlertTriangle size={15} /> Top 5 active batches</div>
          </div>
          {topBatches.length === 0 && <div className="lt-empty-desc">No flagged batches right now.</div>}
          {topBatches.map(b => (
            <div className="lt-alert-row" key={b}>
              <div className="lt-alert-icon" style={{ background: "#FAE7E4" }}><AlertTriangle size={15} color="#B0362B" /></div>
              <div>
                <div className="lt-alert-text"><span className="lt-alert-batch">{b}</span></div>
                <button className="lt-alert-link" onClick={() => goTo("batchDetail", b)}>Investigate →</button>
              </div>
            </div>
          ))}
        </div>

        <div className="lt-card lt-panel">
          <div className="lt-panel-head">
            <div className="lt-panel-title"><AlertTriangle size={15} /> Top 5 active products</div>
          </div>
          {topProducts.length === 0 && <div className="lt-empty-desc">No flagged products right now.</div>}
          {topProducts.map(name => (
            <div className="lt-alert-row" key={name}>
              <div className="lt-alert-icon" style={{ background: "#FAE7E4" }}><AlertTriangle size={15} color="#B0362B" /></div>
              <div className="lt-alert-text">{name}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   PRODUCTS
   ============================================================ */
const MONTH_IDX = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
function parseDMY(s) {
  if (!s || s === "—") return null;
  const parts = s.split(" ");
  if (parts.length !== 3) return null;
  return new Date(Number(parts[2]), MONTH_IDX[parts[1]] ?? 0, Number(parts[0]));
}
function batchRangeFor(productId) {
  const list = BATCHES.filter(b => b.productId === productId)
    .slice()
    .sort((a, b) => (parseDMY(a.created) || 0) - (parseDMY(b.created) || 0));
  if (!list.length) return { first: "—", last: "—" };
  return { first: list[0].batch, last: list[list.length - 1].batch };
}

function ProductsPage({ role, goTo }) {
  const [products, setProducts] = useState(PRODUCTS);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const rows = role === "manufacturer" ? products.filter(p => p.manufacturer === "Kaveri Lubricants Pvt Ltd") : products;

  function fireToast(msg) { setToast({ msg }); setTimeout(() => setToast(null), 3000); }

  function saveNewProduct(form) {
    const newId = `PRD-${1200 + products.length + 1}`;
    setProducts(ps => [...ps, {
      id: newId, name: form.name || "Untitled product", category: form.category, manufacturer: "Kaveri Lubricants Pvt Ltd",
      desc: form.desc, shelfLife: form.shelfLife || "Not configured", mfgDate: form.mfgDate || "—", expiryDate: "—", updated: "Just now",
    }]);
    setShowCreate(false);
    fireToast(`Product ${newId} created.`);
  }

  function saveEditedProduct(id, form) {
    setProducts(ps => ps.map(p => p.id === id ? { ...p, ...form } : p));
    setEditing(null);
    fireToast(`Product ${id} updated.`);
  }

  return (
    <>
      <PageHead
        title="Products"
        desc={role === "employee" ? "View-only access to the product catalog." : "Every product must have a unique Product ID before batches or labels can be created against it."}
        action={role !== "employee" && <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Add product</button>}
      />
      <div className="filters-bar">
        <input className="input" placeholder="Search product ID or name" />
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5C6572" }}>
          First batch mfg date <input className="input" type="date" style={{ minWidth: 130 }} /> –
          <input className="input" type="date" style={{ minWidth: 130 }} />
        </span>
      </div>
      <div className="lt-card lt-table-wrap">
        <table className="lt-table">
          <thead><tr><th>Product ID</th><th>Name</th><th>Category</th><th>First batch</th><th>Last batch</th><th>Mfg date</th><th>Expiry date</th><th>Shelf life</th><th></th></tr></thead>
          <tbody>
            {rows.map(p => {
              const range = batchRangeFor(p.id);
              return (
                <tr key={p.id}>
                  <td className="lt-mono">{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td className="lt-mono">{range.first}</td>
                  <td className="lt-mono">{range.last}</td>
                  <td>{p.mfgDate}</td>
                  <td>{p.expiryDate}</td>
                  <td>{p.shelfLife}</td>
                  <td>{role !== "employee" && <button className="lt-row-link" onClick={() => setEditing(p)}>Edit →</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <ProductFormModal
          title="Add product"
          onClose={() => setShowCreate(false)}
          onSave={saveNewProduct}
        />
      )}
      {editing && (
        <ProductFormModal
          title={`Edit product — ${editing.name}`}
          product={editing}
          onClose={() => setEditing(null)}
          onSave={(form) => saveEditedProduct(editing.id, form)}
        />
      )}
      <Toast toast={toast} />
    </>
  );
}

function ProductFormModal({ title, product, onClose, onSave }) {
  const [name, setName] = useState(product?.name || "");
  const [mfgDate, setMfgDate] = useState("");
  const [category, setCategory] = useState(product?.category || "Engine Oil");
  const [desc, setDesc] = useState(product?.desc || "");
  const [shelfLife, setShelfLife] = useState(product?.shelfLife && !product.shelfLife.includes("Not configured") ? product.shelfLife : "");

  return (
    <Modal title={title} width={560} onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave({ name, category, desc, mfgDate, shelfLife })}>Save product</button>
      </>}>
      <div className="form-grid">
        <div className="full">
          <Field label="Product name"><input className="input" placeholder="e.g. SynthoShield 10W-30 Engine Oil" value={name} onChange={e => setName(e.target.value)} /></Field>
        </div>
        <Field label="Manufacturing date"><input className="input" type="date" value={mfgDate} onChange={e => setMfgDate(e.target.value)} /></Field>
        <Field label="Category">
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
            <option>Engine Oil</option><option>Hydraulic Fluid</option><option>Gear Oil</option><option>Coolant</option>
          </select>
        </Field>
        <div className="full"><Field label="Description"><textarea className="input" rows={3} placeholder="Short description shown in the product detail view" value={desc} onChange={e => setDesc(e.target.value)} /></Field></div>
        <div className="full"><Field label="Shelf life override" hint="Leave blank to use the manufacturer default."><input className="input" placeholder="e.g. 24 Months" value={shelfLife} onChange={e => setShelfLife(e.target.value)} /></Field></div>
      </div>
    </Modal>
  );
}

/* ============================================================
   LABEL GENERATION
   ============================================================ */
function LabelGenerationPage() {
  const [productName, setProductName] = useState("");
  const [batchNo, setBatchNo] = useState("B-2026-0842");
  const [mrp, setMrp] = useState("");
  const [count, setCount] = useState("");
  const [job, setJob] = useState(null); // null | 'queued' | 'processing' | 'complete'

  const canGenerate = productName.trim() && mrp && count && Number(count) > 0;

  function generate() {
    if (!canGenerate) return;
    setJob("queued");
    setTimeout(() => setJob("processing"), 550);
    setTimeout(() => setJob("complete"), 1500);
  }

  const previewTokens = ["TKN-9F31-0001", "TKN-9F31-0002", "TKN-9F31-0003"];

  return (
    <>
      <PageHead title="Label generation" desc="Create a batch, resolve shelf life automatically, and mint QR codes or barcodes for it." />
      <div className="lt-grid" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
        <div className="lt-card lt-panel">
          <div className="lt-panel-title" style={{ marginBottom: 16 }}>Create batch</div>
          <Field label="Product name">
            <input className="input" placeholder="e.g. SynthoShield 20W-40 Engine Oil" value={productName} onChange={e => { setProductName(e.target.value); setJob(null); }} />
          </Field>
          <Field label="Batch number" hint="System-suggested — editable if needed.">
            <input className="input lt-mono" value={batchNo} onChange={e => setBatchNo(e.target.value)} />
          </Field>
          <div className="form-grid">
            <Field label="Manufacturing date" hint="Set automatically to today.">
              <input className="input" value="02 Sep 2026" disabled />
            </Field>
            <Field label="Expiry date" hint={productName.trim() ? "Auto-calculated from the resolved shelf life." : "Resolved once a product name is entered."}>
              <input className="input" value={productName.trim() ? "02 Sep 2028" : "—"} disabled />
            </Field>
          </div>
          <div className="form-grid">
            <Field label="MRP (₹)"><input className="input" type="number" placeholder="e.g. 1450" value={mrp} onChange={e => setMrp(e.target.value)} /></Field>
            <Field label="Number of codes to generate" error={count && Number(count) <= 0 ? "Enter a positive whole number." : null}>
              <input className="input" type="number" placeholder="e.g. 5000" value={count} onChange={e => setCount(e.target.value)} />
            </Field>
          </div>
          <button className="btn btn-primary" disabled={!canGenerate} onClick={generate} style={{ width: "100%", justifyContent: "center" }}>
            <QrCode size={15} /> Generate codes
          </button>
          {!canGenerate && <div className="hint" style={{ marginTop: 8 }}>Enter a product name, MRP, and a positive number of codes to enable generation.</div>}
        </div>

        <div className="lt-card lt-panel">
          <div className="lt-panel-title" style={{ marginBottom: 16 }}>Generation job &amp; result</div>
          {!job && <EmptyState icon={QrCode} title="No job running" desc="Submit the form to start minting codes for this batch. Results appear here." />}
          {job && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                {job !== "complete" ? <RefreshCw size={16} className="lt-spin" color="#0E7C74" /> : <CheckCircle2 size={16} color="#1E8E5A" />}
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {job === "queued" && "Generation job — queued"}
                  {job === "processing" && "Generation job — processing"}
                  {job === "complete" && "Generation job — complete"}
                </span>
              </div>
              {job === "complete" && (
                <>
                  <div className="kv-row"><span className="kv-label">Product name</span><span className="kv-val">{productName}</span></div>
                  <div className="kv-row"><span className="kv-label">Batch number</span><span className="kv-val lt-mono">{batchNo}</span></div>
                  <div className="kv-row"><span className="kv-label">Number of labels</span><span className="kv-val">{Number(count).toLocaleString()}</span></div>
                  <div className="kv-row"><span className="kv-label">Status</span><span className="kv-val"><Badge status="ACTIVE" /></span></div>
                  <div style={{ marginTop: 16, marginBottom: 8, fontSize: 12, fontWeight: 700, color: "#8A8F97" }}>TOKEN PREVIEW</div>
                  <div style={{ background: "#FAFAF8", border: "1px solid #E1E3DE", borderRadius: 6, padding: "10px 12px" }}>
                    {previewTokens.map(t => <div key={t} className="lt-mono" style={{ fontSize: 12.5, padding: "3px 0" }}>{t}</div>)}
                    <div style={{ fontSize: 12, color: "#8A8F97", marginTop: 4 }}>+{Number(count) - 3} more in the full export</div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                    <button className="btn btn-outline"><Printer size={14} /> Print sheet</button>
                    <button className="btn btn-primary"><Download size={14} /> Download CSV</button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   DISPATCH CONSOLE
   ============================================================ */
function DispatchConsolePage({ role, onToast }) {
  const activeBatches = (role === "manufacturer" ? BATCHES.filter(b => b.manufacturer === "Kaveri Lubricants Pvt Ltd") : BATCHES).filter(b => b.status === "ACTIVE");
  const [tab, setTab] = useState("Activate codes");
  const [batchNo, setBatchNo] = useState(activeBatches[0]?.batch || "");
  const [progress, setProgress] = useState({ "B-2026-0817": { activated: 420, total: 500 }, "B-2026-0611": { activated: 180, total: 3000 }, "B-2026-0655": { activated: 9500, total: 15000 } });
  const [token, setToken] = useState("");
  const [lastActivated, setLastActivated] = useState({ token: "TKN-2B87-11D4", when: "2 seconds ago" });
  const [history, setHistory] = useState([
    { token: "TKN-2B87-11D4", batch: "B-2026-0817", product: "SynthoShield 20W-40 Engine Oil", when: "2 seconds ago", by: "Ganesh Pawar" },
    { token: "TKN-2B87-11D3", batch: "B-2026-0817", product: "SynthoShield 20W-40 Engine Oil", when: "9 seconds ago", by: "Ganesh Pawar" },
    { token: "TKN-9F31-0876", batch: "B-2026-0655", product: "CoolFlow Radiator Coolant", when: "4 minutes ago", by: "Ganesh Pawar" },
  ]);

  const batch = BATCHES.find(b => b.batch === batchNo);
  const p = progress[batchNo] || { activated: 0, total: batch ? batch.qty : 0 };
  const pct = p.total ? Math.min(100, Math.round((p.activated / p.total) * 100)) : 0;

  function activate(e) {
    e.preventDefault();
    if (!batch) return;
    const tk = token.trim() || `TKN-${Math.random().toString(16).slice(2, 6).toUpperCase()}-${String(p.activated + 1).padStart(4, "0")}`;
    setProgress(prev => ({ ...prev, [batchNo]: { ...p, activated: Math.min(p.total, p.activated + 1) } }));
    setLastActivated({ token: tk, when: "just now" });
    setHistory(h => [{ token: tk, batch: batchNo, product: batch.productName, when: "just now", by: "You" }, ...h]);
    setToken("");
    onToast(`${tk} activated.`);
  }

  return (
    <>
      <PageHead eyebrow="Dispatch / warehouse agent" title="Dispatch console" desc="Single purpose: lock genuine status at the point of physical dispatch." />

      <div style={{ marginBottom: 18 }}>
        <Segmented options={["Activate codes", "My activation history"]} value={tab} onChange={setTab} />
      </div>

      {tab === "Activate codes" ? (
        <div className="lt-card lt-panel">
          <div className="lt-panel-head">
            <div className="lt-panel-title">Activate batch {batchNo || "—"}</div>
            <select className="input" style={{ maxWidth: 220 }} value={batchNo} onChange={e => setBatchNo(e.target.value)}>
              {activeBatches.map(b => <option key={b.batch} value={b.batch}>{b.batch}</option>)}
            </select>
          </div>

          <div className="form-grid" style={{ marginBottom: 6 }}>
            <Field label="Batch number"><input className="input lt-mono" value={batchNo} disabled /></Field>
            <Field label="Product"><input className="input" value={batch ? batch.productName : ""} disabled /></Field>
          </div>

          <div className="lt-dispatch-progress">
            <div className="lt-dispatch-progress-label"><span className="dot" /> Scan codes in sequence — {p.activated.toLocaleString()} of {p.total.toLocaleString()} activated</div>
            <div className="lt-progress-track"><div className="lt-progress-fill" style={{ width: `${pct}%` }} /></div>

            <form onSubmit={activate} style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <input className="input lt-mono" placeholder="Scan or enter token…" value={token} onChange={e => setToken(e.target.value)} />
              <button className="btn btn-primary" type="submit">Activate</button>
            </form>
            <div className="hint" style={{ marginTop: 10 }}>Last activated: <span className="lt-mono">{lastActivated.token}</span> — {lastActivated.when}</div>
          </div>
        </div>
      ) : (
        <div className="lt-card lt-table-wrap">
          <table className="lt-table">
            <thead><tr><th>Token</th><th>Batch</th><th>Product</th><th>Activated</th><th>Activated by</th></tr></thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td className="lt-mono">{h.token}</td>
                  <td className="lt-mono">{h.batch}</td>
                  <td>{h.product}</td>
                  <td>{h.when}</td>
                  <td>{h.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ============================================================
   BATCH MANAGEMENT
   ============================================================ */
function statusSortIndex(b) {
  if (b.status === "IN PRODUCTION") return 0;
  if (b.status === "ACTIVE" && !b.expiringSoon) return 1;
  if (b.status === "ACTIVE" && b.expiringSoon) return 2;
  if (b.status === "EXPIRED") return 3;
  if (b.status === "RECALLED") return 4;
  return 5;
}

function BatchesPage({ role, goTo, openRecall }) {
  const rows = (role === "manufacturer" ? BATCHES.filter(b => b.manufacturer === "Kaveri Lubricants Pvt Ltd") : BATCHES)
    .slice()
    .sort((a, b) => statusSortIndex(a) - statusSortIndex(b));
  return (
    <>
      <PageHead title="Batch management" desc="Every batch generated for a product, with its current status." />
      <div className="filters-bar">
        <input className="input" placeholder="Batch number or Product ID" />
        <select className="input"><option>All statuses</option><option>Active</option><option>In Production</option><option>Expired</option><option>Recalled</option></select>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Manufacturing date</label>
          <input className="input" type="date" />
        </div>
        <button className="btn btn-ghost btn-sm"><Filter size={14} /> More filters</button>
      </div>
      <div className="lt-card lt-table-wrap">
        <table className="lt-table">
          <thead><tr><th>Batch number</th><th>Product ID</th><th>Product name</th><th>Mfg date</th><th>Expiry date</th><th>Qty</th><th>Status</th><th>Created</th><th></th></tr></thead>
          <tbody>
            {rows.map(b => (
              <tr key={b.batch}>
                <td className="lt-mono"><button className="lt-row-link" onClick={() => goTo("batchDetail", b.batch)}>{b.batch}</button></td>
                <td className="lt-mono">{b.productId}</td>
                <td>{b.productName}</td>
                <td>{b.mfg}</td>
                <td>{b.expiry}</td>
                <td>{b.qty.toLocaleString()}</td>
                <td><Badge status={b.expiringSoon ? "EXPIRING SOON" : b.status} /></td>
                <td>{b.created}</td>
                <td>
                  {b.status === "ACTIVE"
                    ? <button className="btn btn-outline btn-sm" onClick={() => openRecall(b)}>Recall</button>
                    : <button className="lt-row-link" onClick={() => goTo("batchDetail", b.batch)}>View →</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function RecallModal({ batch, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  return (
    <Modal title="Recall batch" onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" disabled={!reason.trim()} onClick={() => onConfirm(reason)}><AlertTriangle size={14} /> Confirm recall</button>
      </>}>
      <div className="kv-row"><span className="kv-label">Batch number</span><span className="kv-val lt-mono">{batch.batch}</span></div>
      <div className="kv-row"><span className="kv-label">Product ID</span><span className="kv-val lt-mono">{batch.productId}</span></div>
      <div className="kv-row"><span className="kv-label">Product name</span><span className="kv-val">{batch.productName}</span></div>
      <div style={{ marginTop: 16 }}>
        <Field label="Reason for recall" hint="Required — this is recorded against the batch and shown wherever it appears.">
          <textarea className="input" rows={3} placeholder="e.g. Viscosity out of spec detected in QA retest." value={reason} onChange={e => setReason(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

/* ============================================================
   RECALL MANAGEMENT
   ============================================================ */
function RecallsPage({ role, goTo }) {
  return (
    <>
      <PageHead title="Recall management" desc="Every recall ever issued, with the reason and who issued it." />
      <div className="filters-bar">
        <input className="input" placeholder="Batch number or Product ID" />
        <input className="input" type="date" />
        {role === "admin" && (
          <select className="input"><option>All manufacturers</option>{MANUFACTURERS.map(m => <option key={m.id}>{m.name}</option>)}</select>
        )}
      </div>
      {RECALLS.length === 0 ? (
        <div className="lt-card"><EmptyState icon={AlertTriangle} title="No recalls issued" desc="Recalled batches will appear here as soon as one is confirmed from Batch Management." /></div>
      ) : (
        <div className="lt-card lt-table-wrap">
          <table className="lt-table">
            <thead><tr><th>Batch number</th><th>Product</th><th>Manufacturer</th><th>Reason</th><th>Recalled by</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {RECALLS.map(r => (
                <tr key={r.batch}>
                  <td className="lt-mono">{r.batch}</td>
                  <td>{r.productName}</td>
                  <td>{r.manufacturer}</td>
                  <td style={{ maxWidth: 260 }}>{r.reason}</td>
                  <td>{r.recalledBy}</td>
                  <td>{r.date}</td>
                  <td><button className="lt-row-link" onClick={() => goTo("batchDetail", r.batch)}>View →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ============================================================
   CSV DOWNLOADS
   ============================================================ */
function CsvDownloadsPage({ role, onToast }) {
  const [requestFor, setRequestFor] = useState(null);
  const canDirectDownload = role === "admin" || role === "manufacturer";
  return (
    <>
      <PageHead title="CSV downloads" desc={canDirectDownload ? "Download any previously generated export directly, at any time." : "Download exports from batches you generated. Redownloading an older export needs Admin approval."} />
      <div className="filters-bar">
        <input className="input" type="date" />
        <input className="input" placeholder="Product ID" />
        <input className="input" placeholder="Batch number" />
        <select className="input"><option>All statuses</option><option>Active</option><option>Expired</option><option>Recalled</option></select>
      </div>
      <div className="lt-card lt-table-wrap">
        <table className="lt-table">
          <thead><tr><th>Batch number</th><th>Product ID</th><th>Manufacturer</th><th>Generated</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {CSV_RECORDS.map(r => (
              <tr key={r.id}>
                <td className="lt-mono">{r.batch}</td>
                <td className="lt-mono">{r.productId}</td>
                <td>{r.manufacturer}</td>
                <td>{r.date}</td>
                <td><Badge status={r.status} /></td>
                <td>
                  {(canDirectDownload || r.firstDownload)
                    ? <button className="btn btn-outline btn-sm" onClick={() => onToast(`Downloading CSV for ${r.batch}…`)}><Download size={13} /> Download</button>
                    : <button className="btn btn-ghost btn-sm" onClick={() => setRequestFor(r)}><FileWarning size={13} /> Request redownload</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {requestFor && (
        <Modal title="Request redownload" onClose={() => setRequestFor(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setRequestFor(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { setRequestFor(null); onToast("Redownload request submitted for Admin review."); }}>Submit request</button>
          </>}>
          <div className="kv-row"><span className="kv-label">Batch number</span><span className="kv-val lt-mono">{requestFor.batch}</span></div>
          <div className="kv-row"><span className="kv-label">Product ID</span><span className="kv-val lt-mono">{requestFor.productId}</span></div>
          <div style={{ marginTop: 16 }}>
            <Field label="Reason for request" hint="Required. Your Admin reviews this before the export is made available again.">
              <textarea className="input" rows={3} placeholder="e.g. Original export corrupted during transfer to print vendor." />
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ============================================================
   CSV REDOWNLOAD REQUESTS (ADMIN)
   ============================================================ */
function CsvRequestsPage({ onToast }) {
  const [rows, setRows] = useState(REDOWNLOAD_REQUESTS);
  const [noteFor, setNoteFor] = useState(null);

  function decide(id, status) {
    setRows(rs => rs.map(r => r.id === id ? { ...r, status } : r));
    onToast(status === "Approved" ? "Request approved — CSV made available to requester." : "Request rejected.");
    setNoteFor(null);
  }

  return (
    <>
      <PageHead title="CSV redownload requests" desc="Only Admin can approve a request to redownload a previously generated export." />
      <div className="lt-card lt-table-wrap">
        <table className="lt-table">
          <thead><tr><th>Request</th><th>Requested by</th><th>Role</th><th>Batch</th><th>Reason</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td className="lt-mono">{r.id}</td>
                <td>{r.requestedBy}</td>
                <td>{r.role}</td>
                <td className="lt-mono">{r.batch}</td>
                <td style={{ maxWidth: 240 }}>{r.reason}</td>
                <td>{r.date}</td>
                <td><Badge status={r.status} /></td>
                <td>
                  {r.status === "Pending" ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => decide(r.id, "Approved")}>Approve</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setNoteFor(r)}>Reject</button>
                    </div>
                  ) : <span style={{ color: "#8A8F97", fontSize: 12 }}>Reviewed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {noteFor && (
        <Modal title="Reject request" onClose={() => setNoteFor(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setNoteFor(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => decide(noteFor.id, "Rejected")}>Reject request</button>
          </>}>
          <Field label="Note to requester (optional)"><textarea className="input" rows={3} placeholder="Let them know why, and what to do instead." /></Field>
        </Modal>
      )}
    </>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="lt-segment">
      {options.map(o => (
        <button key={o} type="button" className={value === o ? "active" : ""} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

/* ============================================================
   USERS / ADD USER
   ============================================================ */
function UsersPage({ role, goTo, onToast, users, setUsers }) {
  const scoped = role === "manufacturer";
  const visible = scoped ? users.filter(u => u.manufacturer === "Kaveri Lubricants Pvt Ltd") : users;
  function toggle(id) {
    setUsers(rs => rs.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u));
  }
  return (
    <>
      <PageHead title="Users"
        desc={scoped ? "Accounts at your organization. You can add any role except Admin or Manufacturer." : "Every account with access to LabelTrack, and the role assigned to it."}
        action={<button className="btn btn-primary" onClick={() => goTo("userAdd")}><Plus size={15} /> Add user</button>} />
      <div className="filters-bar">
        <input className="input" placeholder="Search name or email" />
        <select className="input"><option>All roles</option>{!scoped && <option>Admin</option>}{!scoped && <option>Manufacturer</option>}<option>Dispatch Agent</option><option>Label Manufacturer</option><option>Employee</option></select>
      </div>
      <div className="lt-card lt-table-wrap">
        <table className="lt-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Manufacturer</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {visible.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.manufacturer}</td>
                <td><Badge status={u.status} /></td>
                <td>
                  <button className="lt-row-link" onClick={() => goTo("userAdd", u.id)}>Edit</button>
                  <span style={{ margin: "0 7px", color: "var(--line-strong)" }}>·</span>
                  <button className="lt-row-link" onClick={() => toggle(u.id)}>{u.status === "Active" ? "Deactivate" : "Activate"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AddUserPage({ role: actingRole, goTo, onToast, users, setUsers, editId }) {
  const restricted = actingRole === "manufacturer";
  const editingUser = editId ? users.find(u => u.id === editId) : null;
  const [name, setName] = useState(editingUser ? editingUser.name : "");
  const [email, setEmail] = useState(editingUser ? editingUser.email : "");
  const [role, setRole] = useState(editingUser ? editingUser.role : (restricted ? "Dispatch Agent" : "Manufacturer"));
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [permissions, setPermissions] = useState(editingUser ? editingUser.permissions : (ROLE_DEFAULT_PERMISSIONS[restricted ? "Dispatch Agent" : "Manufacturer"] || []));
  const [error, setError] = useState("");

  const roleLower = role.trim().toLowerCase();

  function save() {
    if (!name.trim() || !email.trim() || !role.trim()) { setError("Name, email, and role are required."); return; }
    if (!editingUser && !password) { setError("Set a password for this account."); return; }
    if (restricted && (roleLower === "admin" || roleLower === "manufacturer")) { setError("Admin and Manufacturer roles must be created by an Admin."); return; }
    setError("");
    if (editingUser) {
      setUsers(us => us.map(u => u.id === editingUser.id
        ? { ...u, name, email, role, permissions, password: password ? password : u.password }
        : u));
      onToast("User updated.");
    } else {
      const newUser = {
        id: "U-" + Math.floor(100 + Math.random() * 900),
        name, email, role,
        manufacturer: "—",
        status: "Active",
        permissions,
        password,
      };
      setUsers(us => [...us, newUser]);
      onToast("User created and invited.");
    }
    goTo("users");
  }

  return (
    <>
      <PageHead eyebrow="Users" title={editingUser ? "Edit user" : "Add user"}
        desc={editingUser
          ? "Update this account's details, credentials, and the pages visible in their sidebar."
          : (restricted ? "Create an account at your organization. Admin and Manufacturer roles aren't available here." : "Create a standalone account. They'll sign in with the email and password set here.")} />
      <div className="lt-card lt-panel" style={{ maxWidth: 560 }}>
        <Field label="Username or email"><input className="input" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} /></Field>
        <Field label="Full name"><input className="input" placeholder="e.g. Priya Nair" value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="Password" hint={editingUser ? "Leave blank to keep the current password." : "The person will sign in with this email and password."}>
          <div className="input-icon-wrap">
            <input className="input" type={showPw ? "text" : "password"} placeholder={editingUser ? "••••••••" : "Set a password"} value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" className="input-icon-btn" onClick={() => setShowPw(s => !s)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Field label="Role" hint={restricted ? "Admin and Manufacturer can only be created by an Admin." : "Type the role manually, e.g. Manufacturer, Employee, Dispatch Agent."} error={error}>
          <input className="input" placeholder="e.g. Employee" value={role} onChange={e => setRole(e.target.value)} />
        </Field>
        <PermissionsField selected={permissions} onChange={setPermissions} />
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="btn btn-outline" onClick={() => goTo("users")}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>{editingUser ? "Save changes" : "Save user"}</button>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   SETUP (Admin only)
   ============================================================ */
function SetupPage({ onToast }) {
  const [codeType, setCodeType] = useState("Both");
  const [genLevel, setGenLevel] = useState("Unit-level");

  return (
    <>
      <PageHead eyebrow="Admin only" title="Setup" desc="System-wide defaults, company profile, and branding for the public verification page." />

      <div className="lt-card lt-panel" style={{ marginBottom: 20 }}>
        <div className="lt-panel-head">
          <div className="lt-panel-title">System defaults</div>
          <span style={{ fontSize: 12, color: "#8A8F97" }}>One-time, applies to all new batches</span>
        </div>

        <div className="setup-row" style={{ marginBottom: 4 }}>
          <div>
            <div className="setup-label">Default code type</div>
            <Segmented options={["QR Code", "Barcode", "Both"]} value={codeType} onChange={setCodeType} />
          </div>
          <div>
            <div className="setup-label">Default generation level</div>
            <Segmented options={["Batch-level", "Unit-level"]} value={genLevel} onChange={setGenLevel} />
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <button className="btn btn-primary" onClick={() => onToast("System defaults saved.")}>Save defaults</button>
        </div>
      </div>

      <div className="lt-card lt-panel">
        <div className="lt-panel-head"><div className="lt-panel-title">Company profile</div></div>
        <div className="form-grid">
          <Field label="Company name"><input className="input" defaultValue="Kaveri Lubricants Pvt Ltd" /></Field>
          <Field label="GSTIN / registration no."><input className="input lt-mono" defaultValue="27AACCK1234F1Z5" /></Field>
          <Field label="Contact email"><input className="input" defaultValue="ops@kaverilube.com" /></Field>
          <Field label="Contact phone"><input className="input" defaultValue="+91 20 4567 8900" /></Field>
          <div className="full">
            <Field label="Public verify page branding" hint="Logo file and accent color — shown on the /verify/:token public page.">
              <input className="input" placeholder="Upload a logo file and choose an accent color" />
            </Field>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => onToast("Company profile saved.")}>Save profile</button>
      </div>
    </>
  );
}

/* ============================================================
   PRODUCT / BATCH DETAIL
   ============================================================ */
function DetailPage({ id, role, goTo }) {
  const batch = BATCHES.find(b => b.batch === id) || BATCHES.find(b => b.productId === id);
  const product = PRODUCTS.find(p => p.id === (batch ? batch.productId : id));
  const recall = RECALLS.find(r => r.batch === (batch && batch.batch));
  const anomaly = ANOMALIES.find(a => a.batch === (batch && batch.batch));
  const canSeeAlerts = role === "admin" || role === "manufacturer";

  if (!product) return <div className="lt-card"><EmptyState icon={Package} title="Record not found" desc="This product or batch could not be located." /></div>;

  return (
    <>
      <PageHead eyebrow="Product / batch detail" title={product.name} action={<Badge status={batch ? (batch.expiringSoon ? "EXPIRING SOON" : batch.status) : "ACTIVE"} />} />
      <div className="lt-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="lt-card lt-panel">
          <div className="detail-section">
            <div className="detail-section-title">Product information</div>
            <div className="kv-row"><span className="kv-label">Product ID</span><span className="kv-val lt-mono">{product.id}</span></div>
            <div className="kv-row"><span className="kv-label">Description</span><span className="kv-val" style={{ textAlign: "right", maxWidth: 220 }}>{product.desc}</span></div>
            <div className="kv-row"><span className="kv-label">Manufacturer</span><span className="kv-val">{product.manufacturer}</span></div>
            <div className="kv-row"><span className="kv-label">Category</span><span className="kv-val">{product.category}</span></div>
          </div>
          {batch && (
            <div className="detail-section">
              <div className="detail-section-title">Batch information</div>
              <div className="kv-row"><span className="kv-label">Batch number</span><span className="kv-val lt-mono">{batch.batch}</span></div>
              <div className="kv-row"><span className="kv-label">Quantity</span><span className="kv-val">{batch.qty.toLocaleString()}</span></div>
              <div className="kv-row"><span className="kv-label">Manufacturing date</span><span className="kv-val">{batch.mfg}</span></div>
              <div className="kv-row"><span className="kv-label">Expiry date</span><span className="kv-val">{batch.expiry}</span></div>
            </div>
          )}
        </div>

        <div className="lt-card lt-panel">
          <div className="detail-section">
            <div className="detail-section-title">Label information</div>
            <div className="kv-row"><span className="kv-label">Labels generated</span><span className="kv-val">{batch ? batch.qty.toLocaleString() : "—"}</span></div>
            <div className="kv-row"><span className="kv-label">Generation date</span><span className="kv-val">{batch ? batch.created : "—"}</span></div>
            <div className="kv-row"><span className="kv-label">Generated by</span><span className="kv-val">Arjun Patwardhan</span></div>
          </div>
          <div className="detail-section">
            <div className="detail-section-title">Recall information</div>
            {recall ? (
              <>
                <div className="kv-row"><span className="kv-label">Reason</span><span className="kv-val" style={{ textAlign: "right", maxWidth: 220 }}>{recall.reason}</span></div>
                <div className="kv-row"><span className="kv-label">Recalled by</span><span className="kv-val">{recall.recalledBy}</span></div>
                <div className="kv-row"><span className="kv-label">Recall date</span><span className="kv-val">{recall.date}</span></div>
              </>
            ) : <div style={{ fontSize: 13, color: "#5C6572" }}>No recall associated with this batch.</div>}
          </div>
          {canSeeAlerts && anomaly && (
            <div className="detail-section">
              <div className="detail-section-title">Anomaly flag</div>
              <div className="lt-alert-row">
                <div className="lt-alert-icon" style={{ background: "#FAE7E4" }}><AlertTriangle size={15} color="#B0362B" /></div>
                <div className="lt-alert-text">{anomaly.text}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   CONSUMER VERIFICATION (public)
   ============================================================ */
const VERIFY_CODE_MAP = {
  "LT-0817-ACT": "activated",
  "LT-0817-SCN": "firstScan",
  "LT-0790-DUP": "duplicate",
  "LT-0602-RCL": "recalled",
  "LT-0331-EXP": "expired",
};

const VERIFY_STATES = {
  activated: {
    tone: "ok", icon: CheckCircle2, title: "Genuine · activated at dispatch",
    sub: "This code was locked to a real unit before it left the warehouse.",
    fields: [
      ["Product", "Lubricant 5L"], ["Manufacturer", "Example Industries"],
      ["Batch", "B-2026-0817"], ["Mfg / expiry", "02 Sep 26 / 02 Sep 28"],
      ["MRP", "INR 4,250"], ["Scan count", "1"],
    ],
    note: "Viscosity grade ISO VG 46. See safety data sheet before handling.",
  },
  firstScan: {
    tone: "ok", icon: CheckCircle2, title: "Genuine · first scan",
    sub: "Valid code, not yet marked activated at dispatch.",
    fields: [["Product", "Lubricant 5L"], ["Batch", "B-2026-0817"], ["Scan count", "1"]],
  },
  duplicate: {
    tone: "warn", icon: AlertTriangle, title: "Already verified — possible duplicate",
    sub: "This code hasn't been activated but has been scanned more than once. It may be cloned.",
    fields: [["Batch", "B-2026-0790"], ["Scan count", "4"]],
  },
  recalled: {
    tone: "bad", icon: XCircle, title: "Recalled",
    sub: "This batch has been recalled. Do not use this product.",
    fields: [["Batch", "B-2026-0602"]],
    note: "Recalled 28 Aug 2026 — viscosity out of spec. Contact the manufacturer for return instructions.",
  },
  expired: {
    tone: "flat", icon: Clock, title: "Expired",
    sub: "This product has passed its expiry date.",
    fields: [["Batch", "B-2025-0331"], ["Expired", "31 Mar 2026"]],
  },
  fake: {
    tone: "bad", icon: XCircle, title: "Fake / not recognized",
    sub: "This code doesn't match any issued product. No further details are shown.",
    fields: [],
  },
};

const VERIFY_TABS = [
  ["activated", "Genuine · activated"], ["firstScan", "Genuine · first scan"],
  ["duplicate", "Already verified"], ["recalled", "Recalled"],
  ["expired", "Expired"], ["fake", "Fake / not recognized"],
];

function mapScanResponseToView(data) {
  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  };
  const fmtMrp = (v) => v == null ? "—" : `INR ${Number(v).toLocaleString()}`;

  switch (data.result) {
    case "genuine_activated":
      return {
        tone: "ok", icon: CheckCircle2, title: "Genuine · activated at dispatch",
        sub: "This code was locked to a real unit before it left the warehouse.",
        fields: [
          ["Product", data.product], ["Manufacturer", data.manufacturer],
          ["Batch", data.batch], ["Mfg / expiry", `${fmtDate(data.mfg)} / ${fmtDate(data.expiry)}`],
          ["MRP", fmtMrp(data.mrp)],
        ],
      };
    case "genuine_first_scan":
      return {
        tone: "ok", icon: CheckCircle2, title: "Genuine · first scan",
        sub: "Valid code, not yet marked activated at dispatch.",
        fields: [
          ["Product", data.product], ["Manufacturer", data.manufacturer],
          ["Batch", data.batch], ["Mfg / expiry", `${fmtDate(data.mfg)} / ${fmtDate(data.expiry)}`],
          ["MRP", fmtMrp(data.mrp)],
        ],
      };
    case "already_verified":
      return {
        tone: "warn", icon: AlertTriangle, title: "Already verified — possible duplicate",
        sub: "This code has been scanned more than once. It may be cloned.",
        fields: [
          ["Product", data.product], ["Batch", data.batch],
        ],
      };
    case "recalled":
      return {
        tone: "bad", icon: XCircle, title: "Recalled",
        sub: "This batch has been recalled. Do not use this product.",
        fields: [["Product", data.product], ["Batch", data.batch]],
      };
    case "expired":
      return {
        tone: "flat", icon: Clock, title: "Expired",
        sub: "This product has passed its expiry date.",
        fields: [["Product", data.product], ["Batch", data.batch], ["Expired", fmtDate(data.expiry)]],
      };
    case "fake":
    default:
      return {
        tone: "bad", icon: XCircle, title: "Fake / not recognized",
        sub: "This code doesn't match any issued product. No further details are shown.",
        fields: [],
      };
  }
}

function LiveVerifyPage({ token }) {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(null);

  React.useEffect(() => {
    fetch(`http://localhost:5000/scan/${token}`)
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ data }) => setView(mapScanResponseToView(data)))
      .catch(() => setView(mapScanResponseToView({ result: "fake" })))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="lt-verify-wrap">
        <div className="lt-verify-shell">
          <div className="lt-verify-card" style={{ textAlign: "center", padding: "40px 0" }}>
            <RefreshCw size={20} className="lt-spin" color="#0E7C74" />
          </div>
        </div>
      </div>
    );
  }

  const cfg = view;
  const Icon = cfg.icon;

  return (
    <div className="lt-verify-wrap">
      <div className="lt-verify-shell">
        <div className="lt-verify-card">
          <div className={`lt-verify-icon ${cfg.tone}`}><Icon size={26} /></div>
          <div className="lt-verify-title">{cfg.title}</div>
          <div className="lt-verify-sub">{cfg.sub}</div>
          {cfg.fields.length > 0 && (
            <div>
              {cfg.fields.map(([label, val]) => (
                <div className="kv-row" key={label}><span className="kv-label">{label}</span><span className="kv-val lt-mono">{val}</span></div>
              ))}
            </div>
          )}
          {cfg.fields.length === 0 && (
            <div className="lt-empty" style={{ padding: "10px 0 4px" }}>
              <div className="lt-empty-desc">To protect against counterfeit lookups, unrecognized codes never reveal product or batch details.</div>
            </div>
          )}
          <button className="btn btn-outline lt-verify-report">
            <MessageSquareWarning size={15} /> Report a concern
          </button>
        </div>
      </div>
    </div>
  );
}

function VerifyPage({ onBack }) {
  const [state, setState] = useState("activated");
  const cfg = VERIFY_STATES[state];
  const Icon = cfg.icon;

  return (
    <div className="lt-verify-wrap">
      <div className="lt-verify-shell">
        <div className="lt-verify-topbar">
          <button className="btn btn-ghost btn-sm" onClick={onBack}><ArrowLeft size={14} /> Back</button>
        </div>

        <div className="lt-tab-row">
          {VERIFY_TABS.map(([key, label]) => (
            <button key={key} className={`lt-tab ${state === key ? "active" : ""}`} onClick={() => setState(key)}>{label}</button>
          ))}
        </div>

        <div className="lt-verify-card">
          <div className={`lt-verify-icon ${cfg.tone}`}><Icon size={26} /></div>
          <div className="lt-verify-title">{cfg.title}</div>
          <div className="lt-verify-sub">{cfg.sub}</div>

          {cfg.fields.length > 0 && (
            <div style={{ marginBottom: cfg.note ? 0 : 4 }}>
              {cfg.fields.map(([label, val]) => (
                <div className="kv-row" key={label}><span className="kv-label">{label}</span><span className="kv-val lt-mono">{val}</span></div>
              ))}
            </div>
          )}
          {cfg.note && <div className="lt-verify-note">{cfg.note}</div>}
          {cfg.fields.length === 0 && !cfg.note && (
            <div className="lt-empty" style={{ padding: "10px 0 4px" }}>
              <div className="lt-empty-desc">To protect against counterfeit lookups, unrecognized codes never reveal product or batch details.</div>
            </div>
          )}
          <button className="btn btn-outline lt-verify-report">
            <MessageSquareWarning size={15} /> Report a concern
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   APP SHELL
   ============================================================ */
export default function LabelTrackApp() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState("admin");
  const [page, setPage] = useState("dashboard");
  const [param, setParam] = useState(null);
  const [recallTarget, setRecallTarget] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [publicVerify, setPublicVerify] = useState(false);
  const [users, setUsers] = useState(USERS);
  const [currentUserId, setCurrentUserId] = useState(null);
  const scanMatch = window.location.pathname.match(/^\/scan\/(.+)$/);
if (scanMatch) {
  return <div className="lt-root"><style>{CSS}</style><LiveVerifyPage token={scanMatch[1]} /></div>;
}

  function fireToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  function goTo(p, prm) {
    setParam(prm || null);
    if (ROLE_ALLOWED[p] && !ROLE_ALLOWED[p].includes(role)) { setPage("accessDenied"); return; }
    setPage(p);
  }

  function login(userOrRole) {
    if (typeof userOrRole === "string") {
      // "Preview as a role" demo buttons
      const r = userOrRole;
      setRole(r);
      setCurrentUserId(ROLE_DEMO_USER_ID[r]);
      setPage(LANDING[r]);
      setAuthed(true);
    } else {
      // Real email/password sign-in against a matched user record
      const u = userOrRole;
      const sysRole = normalizeRole(u.role);
      setRole(sysRole);
      setCurrentUserId(u.id);
      setPage(LANDING[sysRole] || "dashboard");
      setAuthed(true);
    }
  }

  function logout() {
    setAuthed(false);
    setMenuOpen(false);
    setPage("dashboard");
  }

  const currentUser = users.find(u => u.id === currentUserId) || null;
  const isAdminAccount = role === "admin";
  // The full page catalog (admin's list) is the single source of truth for
  // icon/label/section; which of those actually render is driven entirely
  // by the logged-in user's selected permissions, not by their role text.
  const navItems = NAV_CONFIG.admin
    .filter(item => {
      if (item.key === "setup") return isAdminAccount; // never assignable, Admin only
      if (!currentUser) return true;
      return currentUser.permissions && currentUser.permissions.includes(item.key);
    })
    .map(item => (isAdminAccount ? item : { ...item, section: undefined }));
  const initials = currentUser
    ? currentUser.name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : { admin: "RD", manufacturer: "AP", labelmfr: "SK", employee: "MI" }[role];
  const pageTitleMap = {
    dashboard: "Dashboard", users: "Users", userAdd: "Add user",
    products: "Products", productDetail: "Product detail",
    labelGeneration: "Label generation", dispatchConsole: "Dispatch console", batches: "Batch management", batchDetail: "Batch detail",
    recalls: "Recall management", csvDownloads: "CSV downloads", csvRequests: "Redownload requests",
    setup: "Setup", accessDenied: "Access denied",
  };

  if (publicVerify) {
    return <div className="lt-root"><style>{CSS}</style><VerifyPage onBack={() => setPublicVerify(false)} /></div>;
  }

  if (!authed) {
    return (
      <div className="lt-root">
        <style>{CSS}</style>
        <LoginPage onLogin={login} onViewVerify={() => setPublicVerify(true)} users={users} />
      </div>
    );
  }

  return (
    <div className="lt-root">
      <style>{`${CSS}
        .lt-spin { animation: lt-spin 1s linear infinite; }
        @keyframes lt-spin { to { transform: rotate(360deg); } }
      `}</style>
      <div className="lt-shell">
        <aside className="lt-sidebar">
          <div className="lt-brand">
            <div className="lt-brand-mark"><QrCode size={16} /></div>
            <div>
              <div className="lt-brand-name">LabelTrack</div>
              <div className="lt-brand-sub">Batch &amp; Label Platform</div>
            </div>
          </div>
          <nav className="lt-nav">
            {navItems.map((item, i) => (
              <React.Fragment key={item.key}>
                {item.section && item.section !== navItems[i - 1]?.section && (
                  <div className="lt-nav-section">{item.section}</div>
                )}
                <button className={`lt-nav-item ${page === item.key || (page === "productDetail" && item.key === "products") || (page === "batchDetail" && item.key === "batches") || (page === "userAdd" && item.key === "users") ? "active" : ""}`}
                  onClick={() => goTo(item.key)}>
                  <item.icon size={16} /> {item.label}
                </button>
              </React.Fragment>
            ))}
          </nav>
          <div className="lt-sidebar-foot">v3.0 · Sept 2026 release</div>
        </aside>

        <div className="lt-main">
          <header className="lt-header">
            <div>
              <div className="lt-header-title">{pageTitleMap[page] || ""}</div>
              <div className="lt-header-crumb">LabelTrack / {pageTitleMap[page] || ""}</div>
            </div>
            <div className="lt-profile">
              <span className="lt-role-pill">{ROLE_LABEL[role]}</span>
              <button className="lt-menu-btn" onClick={() => setMenuOpen(o => !o)}>
                <div className="lt-avatar">{initials}</div>
                <ChevronDown size={15} color="#5C6572" />
              </button>
              {menuOpen && (
                <div className="lt-dropdown" onMouseLeave={() => setMenuOpen(false)}>
                  <button className="lt-dropdown-item"><KeyRound size={14} /> Account settings</button>
                  <button className="lt-dropdown-item danger" onClick={logout}><LogOut size={14} /> Logout</button>
                </div>
              )}
            </div>
          </header>

          <main className="lt-content">
            {page === "accessDenied" && <AccessDenied onBack={() => goTo(LANDING[role])} />}
            {page === "dashboard" && <Dashboard role={role} goTo={goTo} />}
            {page === "products" && <ProductsPage role={role} goTo={goTo} />}
            {page === "productDetail" && <DetailPage id={param} role={role} goTo={goTo} />}
            {page === "labelGeneration" && <LabelGenerationPage />}
            {page === "batches" && <BatchesPage role={role} goTo={goTo} openRecall={setRecallTarget} />}
            {page === "batchDetail" && <DetailPage id={param} role={role} goTo={goTo} />}
            {page === "recalls" && <RecallsPage role={role} goTo={goTo} />}
            {page === "csvDownloads" && <CsvDownloadsPage role={role} onToast={(m) => fireToast(m)} />}
            {page === "csvRequests" && <CsvRequestsPage onToast={(m) => fireToast(m)} />}
            {page === "users" && <UsersPage role={role} goTo={goTo} onToast={(m) => fireToast(m)} users={users} setUsers={setUsers} />}
            {page === "userAdd" && <AddUserPage role={role} goTo={goTo} onToast={(m) => fireToast(m)} users={users} setUsers={setUsers} editId={param} />}
            {page === "setup" && <SetupPage onToast={(m) => fireToast(m)} />}
            {page === "dispatchConsole" && <DispatchConsolePage role={role} onToast={(m) => fireToast(m)} />}
          </main>
        </div>
      </div>

      {recallTarget && (
        <RecallModal batch={recallTarget} onClose={() => setRecallTarget(null)}
          onConfirm={() => { fireToast(`Batch ${recallTarget.batch} recalled.`); setRecallTarget(null); }} />
      )}
      <Toast toast={toast} />
    </div>
  );
}
