import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import client from "../api/client";
import PageHead from "../components/PageHead";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/dashboard").then((res) => setData(res.data)).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="card text-red text-sm">{error}</div>;
  if (!data) return null;

  const totalBatches = data.stats.totalBatches;

  const rawInterval = totalBatches / 5;

  const interval = Math.ceil(rawInterval);

  const yAxisMax = interval * 5;

  console.log("Total batches:", totalBatches);
  console.log("Interval:", interval);
  console.log("Y Axis Max:", yAxisMax);

  return (
    <>
      <PageHead
        eyebrow={data.scoped ? data.manufacturerName : "System-wide"}
        title="Dashboard"
        desc={data.scoped ? "Figures scoped to your manufacturer account." : "Live figures across every manufacturer on the platform."}
      />
      <div className="grid gap-3.5 mb-5" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
        <StatCard label="Total products" value={data.stats.activeProducts} />
        <StatCard label="Total batches" value={data.stats.totalBatches} />
        <StatCard label="In Production batches" value={data.stats.inProduction} />
        <StatCard label="Active batches" value={data.stats.active} />
        <StatCard label="Recalled batches" value={data.stats.recalled} tone="recalled" />
        <StatCard label="Expired batches" value={data.stats.expired} />
      </div>

      <div className="card mb-5">
        <div className="panel-title mb-4">Batch status overview</div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.batchStatusBar} margin={{ left: -18, top: 4, right: 8 }}>
              <CartesianGrid stroke="#E1E3DE" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8A8F97" }} axisLine={{ stroke: "#E1E3DE" }} tickLine={false} />
              {/* <YAxis tick={{ fontSize: 11, fill: "#8A8F97" }} axisLine={false} tickLine={false} /> */}
              <YAxis domain={[0, yAxisMax]} ticks={[0, interval, interval * 2, interval * 3, interval * 4, interval * 5]} tick={{ fontSize: 11, fill: "#8A8F97" }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E1E3DE" }} />
              <Bar dataKey="v" fill="#0E7C74" radius={[4, 4, 0, 0]} name="Batches" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-3.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
    <div className="panel-title mb-3">
      <AlertTriangle size={15} /> Top 5 active batches
    </div>

    {data.topActiveBatches.length === 0 && (
      <div className="text-[12.5px] text-muted">
        No active batches right now.
      </div>
    )}

    {data.topActiveBatches.map((b) => (
      <div
        className="flex items-start gap-3 py-3 border-b border-line last:border-none"
        key={b.batchNo}
      >
        <div className="w-[30px] h-[30px] rounded-md flex items-center justify-center flex-shrink-0 bg-red-tint">
          <AlertTriangle size={15} className="text-red" />
        </div>

        <div>
          <div className="text-[13px] text-text leading-snug">
            <span className="font-bold text-ink-soft">
              {b.batchNo}
            </span>
          </div>

          <div className="text-xs text-muted mt-0.5">
            {b.scanCount} scans
          </div>

          <button
            className="text-xs font-semibold text-accent-dark mt-0.5"
            onClick={() => navigate(`/batches/${b.batchNo}`)}
          >
            Investigate →
          </button>
        </div>
      </div>
    ))}
  </div>

        <div className="card">
  <div className="panel-title mb-3">
    <AlertTriangle size={15} /> Top 5 active products
  </div>

  {data.topActiveProducts.length === 0 && (
    <div className="text-[12.5px] text-muted">
      No active products right now.
    </div>
  )}

  {data.topActiveProducts.map((p) => (
    <div
      className="flex items-start gap-3 py-3 border-b border-line last:border-none"
      key={p.productId}
    >
      <div className="w-[30px] h-[30px] rounded-md flex items-center justify-center flex-shrink-0 bg-red-tint">
        <AlertTriangle size={15} className="text-red" />
      </div>

      <div>
        <div className="text-[13px] text-text">
          <span className="font-bold text-ink-soft">
            {p.productName}
          </span>
        </div>

        <div className="text-xs text-muted mt-0.5">
          {p.scanCount} scans
        </div>
      </div>
    </div>
  ))}
</div>
      </div>
    </>
  );
}
