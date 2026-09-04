import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LANDING = { admin: "/", manufacturer: "/", employee: "/products" };

const DEMO_ACCOUNTS = [
  { role: "admin", label: "Admin", note: "Full access", email: "rhea.deshmukh@labeltrack.com" },
  { role: "manufacturer", label: "Manufacturer", note: "Scoped to own data", email: "arjun.p@kaverilube.com" },
  { role: "employee", label: "Employee", note: "Products (view) + downloads", email: "manoj.iyer@kaverilube.com" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!email || !pw) { setError("Enter your email and password to continue."); return; }
    setBusy(true);
    setError("");
    try {
      const user = await login(email, pw);
      navigate(LANDING[user.systemRole] || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function quickLogin(demoEmail) {
    setEmail(demoEmail);
    setPw("Demo@123");
    setBusy(true);
    setError("");
    try {
      const user = await login(demoEmail, "Demo@123");
      navigate(LANDING[user.systemRole] || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink"
      style={{ backgroundImage: "radial-gradient(circle at 15% 20%, rgba(14,124,116,.35), transparent 40%), radial-gradient(circle at 85% 80%, rgba(14,124,116,.2), transparent 45%)" }}>
      <div className="w-[400px] max-w-[92vw] bg-white rounded-xl px-8 py-[34px] shadow-2xl">
        <div className="flex items-center gap-[11px] mb-6">
          <div className="w-[30px] h-[30px] rounded-md bg-accent flex items-center justify-center text-white">
            <QrCode size={17} />
          </div>
          <div>
            <div className="font-bold text-[15.5px] text-ink-soft">LabelTrack</div>
            <div className="text-[10.5px] text-faint">Label Generation &amp; Batch Management</div>
          </div>
        </div>
        <div className="text-[19px] font-bold text-ink-soft mb-1">Sign in to your account</div>
        <div className="text-[12.5px] text-muted mb-6">
          Use your registered work email. Your sidebar shows the pages your account was granted.
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label>Username or email</label>
            <input className="input" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <div className="relative">
              <input className="input pr-10" type={showPw ? "text" : "password"} placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-faint p-1" onClick={() => setShowPw((s) => !s)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <div className="err">{error}</div>}
          </div>
          <button className="btn btn-primary w-full justify-center py-[11px]" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-[22px] mb-1.5 pt-4 border-t border-line">
          <div className="text-[11.5px] font-semibold text-faint mb-2">DEMO ACCOUNTS</div>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            {DEMO_ACCOUNTS.map((d) => (
              <button
                key={d.role}
                type="button"
                className="border border-line-strong bg-white rounded-md px-2 py-2 text-[11.5px] font-semibold text-ink-soft text-left hover:border-accent hover:bg-accent-tint"
                onClick={() => quickLogin(d.email)}
              >
                {d.label}
                <span className="block text-[10px] text-faint font-medium mt-px">{d.note}</span>
              </button>
            ))}
          </div>
          <div className="text-[11px] text-faint mt-2.5">
            Every seeded account signs in with the password <span className="lt-mono">Demo@123</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
