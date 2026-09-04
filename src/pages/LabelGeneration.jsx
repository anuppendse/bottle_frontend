import React, { useState } from "react";
import { QrCode, CheckCircle2, Download, Printer } from "lucide-react";
import client from "../api/client";
import PageHead from "../components/PageHead";
import Field from "../components/Field";
import Segmented from "../components/Segmented";
import EmptyState from "../components/EmptyState";
import Badge from "../components/Badge";

export default function LabelGeneration() {
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [mrp, setMrp] = useState("");
  const [count, setCount] = useState("");
  const [generationLevel, setGenerationLevel] = useState("Unit-level");
  const [job, setJob] = useState(null); // null | 'processing' | 'complete' | 'error'
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const canGenerate = (productId.trim() || productName.trim()) && mrp && count && Number(count) > 0;

  async function generate() {
    if (!canGenerate) return;
    setJob("processing");
    setError("");
    try {
      const res = await client.post("/labels/generate", {
        productId: productId || undefined,
        productName: productName || undefined,
        batchNo: batchNo || undefined,
        mrp: Number(mrp),
        count: Number(count),
        generationLevel: generationLevel === "Batch-level" ? "batch" : "unit",
      });
      setResult(res.data);
      setJob("complete");
    } catch (e) {
      setError(e.message);
      setJob("error");
    }
  }

  async function downloadCsv() {
    if (!result) return;
    const res = await client.get(`/labels/${result.batch.batch}/csv`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.batch.batch}-codes.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHead title="Label generation" desc="Create a batch, resolve shelf life automatically, and mint QR codes or barcodes for it." />
      <div className="grid gap-3.5 items-start" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <div className="panel-title mb-4">Create batch</div>
          <Field label="Product ID" hint="e.g. PRD-1042 — enter this or a product name below.">
            <input className="input lt-mono" placeholder="e.g. PRD-1042" value={productId} onChange={(e) => { setProductId(e.target.value); setJob(null); }} />
          </Field>
          <Field label="Product name" hint="Used to look up the product if no ID is given.">
            <input className="input" placeholder="e.g. SynthoShield 20W-40 Engine Oil" value={productName} onChange={(e) => { setProductName(e.target.value); setJob(null); }} />
          </Field>
          <Field label="Batch number" hint="Leave blank to auto-generate.">
            <input className="input lt-mono" placeholder="leave blank to auto-generate" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} />
          </Field>
          <div className="field">
            <label>Generation level</label>
            <Segmented options={["Unit-level", "Batch-level"]} value={generationLevel} onChange={setGenerationLevel} />
            <div className="hint mt-1.5">
              {generationLevel === "Batch-level"
                ? "Exactly one code is minted for the whole batch."
                : "One code is minted per unit — the field below sets how many."}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-5">
            <Field label="MRP (₹)"><input className="input" type="number" placeholder="e.g. 1450" value={mrp} onChange={(e) => setMrp(e.target.value)} /></Field>
            <Field label="Number of units" error={count && Number(count) <= 0 ? "Enter a positive whole number." : null}>
              <input className="input" type="number" placeholder="e.g. 5000" value={count} onChange={(e) => setCount(e.target.value)} />
            </Field>
          </div>
          <button className="btn btn-primary w-full justify-center" disabled={!canGenerate || job === "processing"} onClick={generate}>
            <QrCode size={15} /> {job === "processing" ? "Generating…" : "Generate codes"}
          </button>
          {!canGenerate && <div className="hint mt-2">Enter a product ID or name, MRP, and a positive number of units to enable generation.</div>}
          {error && <div className="err mt-2">{error}</div>}
        </div>

        <div className="card">
          <div className="panel-title mb-4">Generation job &amp; result</div>
          {!job && <EmptyState icon={QrCode} title="No job running" desc="Submit the form to start minting codes for this batch. Results appear here." />}
          {job === "complete" && result && (
            <>
              <div className="flex items-center gap-2.5 mb-4.5">
                <CheckCircle2 size={16} className="text-green" />
                <span className="text-[13.5px] font-semibold">Generation job — complete</span>
              </div>
              <div className="kv-row"><span className="kv-label">Product name</span><span className="kv-val">{result.batch.productName}</span></div>
              <div className="kv-row"><span className="kv-label">Batch number</span><span className="kv-val lt-mono">{result.batch.batch.slice(0, 8)}…</span></div>
              <div className="kv-row"><span className="kv-label">Generation level</span><span className="kv-val capitalize">{result.batch.generationLevel}-level</span></div>
              <div className="kv-row"><span className="kv-label">Number of codes minted</span><span className="kv-val">{result.codesGenerated.toLocaleString()}</span></div>
              <div className="kv-row"><span className="kv-label">Status</span><span className="kv-val"><Badge status="ACTIVE" /></span></div>
              <div className="mt-4 mb-2 text-xs font-bold text-faint">TOKEN PREVIEW</div>
              <div className="bg-[#FAFAF8] border border-line rounded-md px-3 py-2.5">
                {result.previewTokens.map((t) => <div key={t} className="lt-mono text-[12.5px] py-0.5">{t}</div>)}
                <div className="text-xs text-faint mt-1">+{result.codesGenerated - result.previewTokens.length} more in the full export</div>
              </div>
              <div className="flex gap-2.5 mt-4.5">
                <button className="btn btn-outline"><Printer size={14} /> Print sheet</button>
                <button className="btn btn-primary" onClick={downloadCsv}><Download size={14} /> Download CSV</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
