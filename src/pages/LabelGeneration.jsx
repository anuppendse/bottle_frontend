import React, { useState, useEffect } from "react";
import { QrCode, Barcode, CheckCircle2, Download, Printer } from "lucide-react";
import client from "../api/client";
import PageHead from "../components/PageHead";
import Field from "../components/Field";
import EmptyState from "../components/EmptyState";
import Badge from "../components/Badge";

export default function LabelGeneration() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [mrp, setMrp] = useState("");
  const [count, setCount] = useState("");
  const [manufacturerLevel, setManufacturerLevel] = useState(null); // "BATCH" | "UNIT" | "BOTH" | null
  const [manufacturerCodeType, setManufacturerCodeType] = useState(null); // "QR" | "BARCODE" | "BOTH" | null
  const [job, setJob] = useState(null); // null | 'processing' | 'complete' | 'error'
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Load the product dropdown once — backend already scopes this to the
  // logged-in manufacturer's own products (admins see all).
  useEffect(() => {
    client.get("/products").then((res) => setProducts(res.data)).catch(() => setProducts([]));
  }, []);

  // Resolve the manufacturer's config as soon as a product is picked.
  useEffect(() => {
    if (!selectedProductId) {
      setManufacturerLevel(null);
      setManufacturerCodeType(null);
      return;
    }
    client
      .get("/products/resolve", { params: { productId: selectedProductId } })
      .then((res) => {
        setManufacturerLevel(res.data.generationLevel);
        setManufacturerCodeType(res.data.codeType);
      })
      .catch(() => {
        setManufacturerLevel(null);
        setManufacturerCodeType(null);
      });
  }, [selectedProductId]);

  const needsCount = manufacturerLevel === "UNIT" || manufacturerLevel === "BOTH";

  const canGenerate = selectedProductId && mrp && (!needsCount || (count && Number(count) > 0));

  const generationLevelLabel =
    manufacturerLevel === "BATCH" ? "Batch-level" :
    manufacturerLevel === "UNIT" ? "Unit-level" :
    manufacturerLevel === "BOTH" ? "Both" : "—";

  async function generate() {
    if (!canGenerate) return;
    setJob("processing");
    setError("");
    try {
      const res = await client.post("/labels/generate", {
        productId: selectedProductId,
        mrp: Number(mrp),
        count: needsCount ? Number(count) : 0,
        generationLevel: manufacturerLevel,
        codeType: manufacturerCodeType,
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

          <Field label="Product" hint="Batch number is generated automatically.">
            <select
              className="input"
              value={selectedProductId}
              onChange={(e) => { setSelectedProductId(e.target.value); setJob(null); }}
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>

          <div className="field">
            <label>Code type</label>
            <div className="inline-flex border border-line-strong rounded-md overflow-hidden opacity-50">
              {["QR", "BARCODE"].map((o) => {
                const isActive =
                  manufacturerCodeType === "BOTH" ? true : manufacturerCodeType === o;
                return (
                  <div
                    key={o}
                    className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold border-r last:border-r-0 border-line-strong ${
                      isActive ? "bg-accent-tint text-accent-dark" : "bg-white text-muted"
                    }`}
                  >
                    {o === "QR" ? <QrCode size={14} /> : <Barcode size={14} />}
                    {o}
                  </div>
                );
              })}
            </div>
            <div className="hint mt-1.5">
              {manufacturerCodeType ? "Set by the manufacturer's configuration — can't be changed here." : "Select a product to see this manufacturer's code type."}
            </div>
          </div>



          {manufacturerLevel && (
            <div className="field">
              <label>Generation level</label>
              <div className="inline-flex border border-line-strong rounded-md overflow-hidden opacity-50">
                <div className="px-4 py-2 text-[13px] font-semibold bg-accent-tint text-accent-dark">
                  {generationLevelLabel}
                </div>
              </div>
              <div className="hint mt-1.5">
                {manufacturerLevel === "BATCH" && "Exactly one code is minted for the whole batch."}
                {manufacturerLevel === "UNIT" && "One code is minted per unit — the field below sets how many."}
                {manufacturerLevel === "BOTH" && "One batch-level code AND one code per unit are both minted."}
              </div>
            </div>
          )}

          <div className={needsCount ? "grid grid-cols-2 gap-x-5" : "grid grid-cols-1"}>
            <Field label="MRP (₹)"><input className="input" type="number" placeholder="e.g. 1450" value={mrp} onChange={(e) => setMrp(e.target.value)} /></Field>
            {needsCount && (
              <Field label="Number of units" error={count && Number(count) <= 0 ? "Enter a positive whole number." : null}>
                <input className="input" type="number" placeholder="e.g. 5000" value={count} onChange={(e) => setCount(e.target.value)} />
              </Field>
            )}
          </div>

          <button className="btn btn-primary w-full justify-center" disabled={!canGenerate || job === "processing"} onClick={generate}>
            <QrCode size={15} /> {job === "processing" ? "Generating…" : "Generate codes"}
          </button>
          {!canGenerate && <div className="hint mt-2">Select a product, enter an MRP, and a positive number of units (if required) to enable generation.</div>}
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
              <div className="kv-row"><span className="kv-label">Batch number</span><span className="kv-val lt-mono">{result.batch.batch}</span></div>
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