import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, XCircle, Clock, MessageSquareWarning, RefreshCw } from "lucide-react";
import client from "../api/client";

/* ============================================================
   SCAN VERIFY — the page a customer lands on the instant they
   scan the QR / barcode printed on a label (route: /scan/:token).
   It auto-looks-up the token, no manual entry needed, and renders
   one of the 6 result screens below.

   Extracted from App3.jsx's LiveVerifyPage + VERIFY_STATES, and
   restyled to match this project's real Verify.jsx conventions
   (Tailwind classes + the existing axios `client`, which already
   calls GET /verify/:token and returns { state, fields, note }).
   ============================================================ */

// The 6 possible outcomes of a scan.
const STATE_META = {
  activated: {
    tone: "ok", icon: CheckCircle2,
    title: "Genuine · activated at dispatch",
    sub: "This code was locked to a real unit before it left the warehouse.",
  },
  firstScan: {
    tone: "ok", icon: CheckCircle2,
    title: "Genuine · first scan",
    sub: "Valid code, not yet marked activated at dispatch.",
  },
  duplicate: {
    tone: "warn", icon: AlertTriangle,
    title: "Already verified — possible duplicate",
    sub: "This code hasn't been activated but has been scanned more than once. It may be cloned.",
  },
  recalled: {
    tone: "bad", icon: XCircle,
    title: "Recalled",
    sub: "This batch has been recalled. Do not use this product.",
  },
  expired: {
    tone: "flat", icon: Clock,
    title: "Expired",
    sub: "This product has passed its expiry date.",
  },
  fake: {
    tone: "bad", icon: XCircle,
    title: "Fake / not recognized",
    sub: "This code doesn't match any issued product. No further details are shown.",
  },
};

const TONE_CLASSES = {
  ok: "bg-green-tint text-green",
  warn: "bg-amber-tint text-amber",
  bad: "bg-red-tint text-red",
  flat: "bg-grey-tint text-grey",
};

export default function ScanVerify() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    client
      .get(`/verify/${encodeURIComponent(token)}`)
      .then((res) => { if (!cancelled) setResult(res.data); })
      .catch((err) => {
        if (cancelled) return;
        // A failed / unknown lookup still shows the "fake" screen rather
        // than a raw error, same as a genuinely unrecognized code.
        setResult({ state: "fake", fields: [] });
        setError(err.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  const cfg = result ? STATE_META[result.state] : null;
  const Icon = cfg?.icon;

  return (
    <div
      className="min-h-screen bg-[#0E1B24] flex flex-col items-center pb-[60px]"
      style={{ backgroundImage: "radial-gradient(circle at 20% 0%, rgba(14,124,116,.18), transparent 45%)" }}
    >
      <div className="max-w-[480px] w-full mx-auto px-[18px] pt-6">
        {loading && (
          <div className="relative bg-white rounded-[18px] px-6 py-10 shadow-2xl text-center">
            <RefreshCw size={22} className="animate-spin text-accent mx-auto" />
          </div>
        )}

        {!loading && cfg && (
          <div className="relative bg-white rounded-[18px] px-6 pt-10 pb-6 shadow-2xl text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${TONE_CLASSES[cfg.tone]}`}>
              <Icon size={26} />
            </div>
            <div className="text-[19px] font-bold text-ink-soft mb-1.5">{cfg.title}</div>
            <div className="text-[13px] text-muted max-w-[340px] mx-auto mb-6 leading-relaxed">{cfg.sub}</div>

            {result.fields?.length > 0 && (
              <div className="text-left">
                {result.fields.map(([label, val]) => (
                  <div className="kv-row" key={label}>
                    <span className="kv-label">{label}</span>
                    <span className="kv-val lt-mono">{val}</span>
                  </div>
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

            <button
              className="btn btn-ghost btn-sm text-muted mt-3"
              onClick={() => navigate("/verify")}
            >
              Enter a code manually instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
