import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users as UsersIcon, Package, QrCode, Boxes, AlertTriangle,
  Download, LogOut, ChevronDown, ClipboardList, Settings, Truck, KeyRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { key: "dashboard", to: "/", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
  { key: "products", to: "/products", label: "Products", icon: Package, section: "Operate" },
  { key: "labelGeneration", to: "/label-generation", label: "Label Generation", icon: QrCode, section: "Operate" },
  { key: "dispatchConsole", to: "/dispatch-console", label: "Dispatch Console", icon: Truck, section: "Operate" },
  { key: "batches", to: "/batches", label: "Batch Management", icon: Boxes, section: "Operate" },
  { key: "recalls", to: "/recalls", label: "Recall Management", icon: AlertTriangle, section: "Operate" },
  { key: "csvDownloads", to: "/csv-downloads", label: "CSV Downloads", icon: Download, section: "Operate" },
  { key: "csvRequests", to: "/csv-requests", label: "Redownload Requests", icon: ClipboardList, section: "Operate" },
  { key: "users", to: "/users", label: "Users", icon: UsersIcon, section: "Admin only" },
  { key: "setup", to: "/setup", label: "Setup", icon: Settings, section: "Admin only" },
];

const PAGE_TITLES = {
  "/": "Dashboard", "/products": "Products", "/label-generation": "Label generation",
  "/dispatch-console": "Dispatch console", "/batches": "Batch management",
  "/recalls": "Recall management", "/csv-downloads": "CSV downloads",
  "/csv-requests": "Redownload requests", "/users": "Users", "/users/new": "Add user",
  "/setup": "Setup",
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.systemRole === "admin";
  // TEMPORARY: manufacturer sees every nav item admin does (except
  // Setup, which stays admin-only), bypassing the permissions-array
  // check — see the matching note in ProtectedRoute.jsx and
  // decorators.py::require_permission. Revert once real permissions
  // are assigned to every Manufacturer account.
  const isManufacturer = user?.systemRole === "manufacturer";
  const bypassPermCheck = isAdmin || isManufacturer;
  const navItems = NAV_ITEMS.filter((item) => {
    if (item.key === "setup") return isAdmin; // never assignable — Admin only
    if (item.key === "csvRequests") return isAdmin; // admin-only page, not a permissions-list gap
    return bypassPermCheck || (user?.permissions || []).includes(item.key);
  }).map((item) => (isAdmin ? item : { ...item, section: undefined }));

  const initials = user?.name
    ? user.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "??";

  const title = Object.keys(PAGE_TITLES).find((p) => location.pathname.startsWith(p) && p !== "/")
    ? PAGE_TITLES[Object.keys(PAGE_TITLES).find((p) => location.pathname.startsWith(p) && p !== "/")]
    : PAGE_TITLES[location.pathname] || "";

  function doLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-[240px] bg-ink text-[#C9D2DE] flex-shrink-0 flex flex-col sticky top-0 h-screen">
        <div className="px-[22px] pt-[22px] pb-[18px] flex items-center gap-2.5 border-b border-white/[.08]">
          <div className="w-[30px] h-[30px] rounded-md bg-accent flex items-center justify-center text-white flex-shrink-0">
            <QrCode size={16} />
          </div>
          <div>
            <div className="font-bold text-[15.5px] text-white tracking-[.2px]">LabelTrack</div>
            <div className="text-[10.5px] text-[#7C8AA3] mt-px">Batch &amp; Label Platform</div>
          </div>
        </div>
        <nav className="px-3 py-3.5 flex-1 overflow-y-auto">
          {navItems.map((item, i) => (
            <React.Fragment key={item.key}>
              {item.section && item.section !== navItems[i - 1]?.section && (
                <div className="text-[10.5px] font-bold tracking-wide uppercase text-[#5B6A87] px-3 pt-3.5 pb-1.5 first:pt-1">
                  {item.section}
                </div>
              )}
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13.5px] font-medium mb-0.5 border w-full text-left ${
                    isActive
                      ? "bg-accent/[.22] text-white border-accent/40"
                      : "text-[#A9B4C6] border-transparent hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <item.icon size={16} className="flex-shrink-0" /> {item.label}
              </NavLink>
            </React.Fragment>
          ))}
        </nav>
        <div className="px-[22px] py-[14px] border-t border-white/[.08] text-[11px] text-[#66738C]">
          v1.0 · React + Flask
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-[62px] bg-surface border-b border-line flex items-center justify-between px-7 sticky top-0 z-20">
          <div>
            <div className="text-[16px] font-bold text-ink-soft">{title}</div>
            <div className="text-xs text-faint mt-px">LabelTrack / {title}</div>
          </div>
          <div className="flex items-center gap-2.5 relative">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-accent-tint text-accent-dark capitalize">
              {user?.role}
            </span>
            <button
              className="flex items-center gap-2 bg-transparent border border-transparent px-2 py-1 rounded-md hover:bg-paper"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center text-[12.5px] font-bold">
                {initials}
              </div>
              <ChevronDown size={15} color="#5C6572" />
            </button>
            {menuOpen && (
              <div
                className="absolute top-[46px] right-0 bg-white border border-line rounded-lg shadow-xl min-w-[190px] p-1.5 z-30"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button className="flex items-center gap-2.5 w-full px-2.5 py-2 text-[13px] rounded-md hover:bg-paper text-left">
                  <KeyRound size={14} /> Account settings
                </button>
                <button
                  className="flex items-center gap-2.5 w-full px-2.5 py-2 text-[13px] rounded-md hover:bg-paper text-left text-red"
                  onClick={doLogout}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="p-7 pb-[60px] flex-1">{children}</main>
      </div>
    </div>
  );
}