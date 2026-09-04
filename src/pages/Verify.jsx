import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Clock, MessageSquareWarning } from "lucide-react";
import client from "../api/client";

const STATE_META = {
  activated: { tone: "ok", icon: CheckCircle2, title: "Genuine · activated at dispatch", sub: "This code was locked to a real unit before it left the warehouse." },
  firstScan: { tone: "ok", icon: CheckCircle2, title: "Genuine · first scan", sub: "Valid code, not yet marked activated at dispatch." },
  duplicate: { tone: "warn", icon: AlertTriangle, title: "Already verified — possible duplicate", sub: "This code hasn't been activated but has been scanned more than once. It may be cloned." },
  recalled: { tone: "bad", icon: XCircle, title: "Recalled", sub: "This batch has been recalled. Do not use this product." },
  expired: { tone: "flat", icon: Clock, title: "Expired", sub: "This product has passed its expiry date." },
  fake: { tone: "bad", icon: XCircle, title: "Fake / not recognized", sub: "This code doesn't match any issued product. No further details are shown." },
};

const TONE_CLASSES = {
  ok: "bg-green-tint text-green",
  warn: "bg-amber-tint text-amber",
  bad: "bg-red-tint text-red",
  flat: "bg-grey-tint text-grey",
};

export default function Verify() {
  const navigate = useNavigate();
  const [tokenInput, setTokenInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkToken(e) {
    e?.preventDefault();
    if (!tokenInput.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await client.get(`/verify/${encodeURIComponent(tokenInput.trim())}`);
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const cfg = result ? STATE_META[result.state] : null;
  const Icon = cfg?.icon;

  return (
    <div className="min-h-screen bg-[#0E1B24] flex flex-col items-center pb-[60px]"
      style={{ backgroundImage: "radial-gradient(circle at 20% 0%, rgba(14,124,116,.18), transparent 45%)" }}>
      <div className="max-w-[480px] w-full mx-auto px-[18px]">
        <div className="flex items-center py-4 px-1">
          <button className="btn btn-ghost btn-sm text-[#9FB0C4] hover:bg-white/[.08] hover:text-white" onClick={() => navigate("/login")}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <form onSubmit={checkToken} className="border border-white/[.14] rounded-[10px] px-4 py-3.5 mb-4.5 bg-white/[.03]">
          <label className="block text-[11.5px] font-semibold text-[#9FB0C4] mb-2">Enter the code printed on the label</label>
          <div className="flex gap-2">
            <input
              className="input bg-white/[.06] border-white/[.18] text-white placeholder:text-[#6E7E93] focus:border-accent"
              placeholder="e.g. TKN-2B87-11D4"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "…" : "Check"}</button>
          </div>
          <div className="text-[11px] text-[#6E7E93] mt-2.5 leading-relaxed">
            The token is printed under the QR code / barcode on the product label.
          </div>
        </form>

        {error && <div className="text-red text-sm text-center mb-4">{error}</div>}

        {cfg && (
          <div className="relative bg-white rounded-[18px] px-6 pt-10 pb-6 shadow-2xl text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${TONE_CLASSES[cfg.tone]}`}>
              <Icon size={26} />
            </div>
            <div className="text-[19px] font-bold text-ink-soft mb-1.5">{cfg.title}</div>
            <div className="text-[13px] text-muted max-w-[340px] mx-auto mb-6 leading-relaxed">{cfg.sub}</div>

            {result.fields?.length > 0 && (
              <div className="text-left">
                {result.fields.map(([label, val]) => (
                  <div className="kv-row" key={label}><span className="kv-label">{label}</span><span className="kv-val lt-mono">{val}</span></div>
                ))}
              </div>
            )}
            {result.note && (
              <div className="bg-amber-tint text-[#8A5B0B] rounded-lg px-3.5 py-3 text-[12.5px] leading-relaxed text-left mt-4.5">
                {result.note}
              </div>
            )}
            {(!result.fields || result.fields.length === 0) && !result.note && (
              <div className="text-center py-2.5">
                <div className="text-[12.5px] text-muted max-w-[340px] mx-auto">
                  To protect against counterfeit lookups, unrecognized codes never reveal product or batch details.
                </div>
              </div>
            )}
            <button className="btn btn-outline w-full justify-center mt-5.5 bg-red-tint text-red border-red-tint font-bold hover:bg-[#F5D3CE]">
              <MessageSquareWarning size={15} /> Report a concern
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
