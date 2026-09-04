import React, { useEffect, useState } from "react";
import client from "../api/client";
import PageHead from "../components/PageHead";
import Field from "../components/Field";
import Segmented from "../components/Segmented";
import Toast from "../components/Toast";
import useToast from "../components/useToast";

export default function DispatchConsole() {
  const [tab, setTab] = useState("Activate codes");
  const [batches, setBatches] = useState([]);
  const [batchNo, setBatchNo] = useState("");
  const [token, setToken] = useState("");
  const [lastActivated, setLastActivated] = useState(null);
  const [history, setHistory] = useState([]);
  const [toast, fireToast] = useToast();

  function loadBatches() {
    client.get("/dispatch/batches").then((res) => {
      setBatches(res.data);
      if (!batchNo && res.data.length) setBatchNo(res.data[0].batch);
    });
  }
  function loadHistory() {
    client.get("/dispatch/history").then((res) => setHistory(res.data));
  }
  useEffect(() => { loadBatches(); loadHistory(); }, []);

  const batch = batches.find((b) => b.batch === batchNo);
  const pct = batch && batch.total ? Math.min(100, Math.round((batch.activated / batch.total) * 100)) : 0;

  async function activate(e) {
    e.preventDefault();
    if (!batch) return;
    try {
      const res = await client.post("/dispatch/activate", { batch: batchNo, token });
      setLastActivated(res.data);
      setToken("");
      fireToast(`${res.data.token} activated.`);
      loadBatches();
      loadHistory();
    } catch (err) {
      fireToast(err.message, "err");
    }
  }

  return (
    <>
      <PageHead eyebrow="Dispatch / warehouse agent" title="Dispatch console" desc="Single purpose: lock genuine status at the point of physical dispatch." />
      <div className="mb-4.5">
        <Segmented options={["Activate codes", "My activation history"]} value={tab} onChange={setTab} />
      </div>

      {tab === "Activate codes" ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="panel-title">Activate batch {batchNo || "—"}</div>
            <select className="input max-w-[220px]" value={batchNo} onChange={(e) => setBatchNo(e.target.value)}>
              {batches.map((b) => <option key={b.batch} value={b.batch}>{b.batch}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-x-5">
            <Field label="Batch number"><input className="input lt-mono" value={batchNo} disabled /></Field>
            <Field label="Product"><input className="input" value={batch ? batch.productName : ""} disabled /></Field>
          </div>

          <div className="bg-[#FAFAF8] border border-line rounded-lg px-4.5 py-4 mt-2">
            <div className="text-[13px] font-semibold text-ink-soft flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
              Scan codes in sequence — {batch ? batch.activated.toLocaleString() : 0} of {batch ? batch.total.toLocaleString() : 0} activated
            </div>
            <div className="w-full h-[9px] bg-line rounded-md overflow-hidden">
              <div className="h-full bg-accent rounded-md transition-all" style={{ width: `${pct}%` }} />
            </div>
            <form onSubmit={activate} className="flex gap-2.5 mt-3.5">
              <input className="input lt-mono" placeholder="Scan or enter token…" value={token} onChange={(e) => setToken(e.target.value)} />
              <button className="btn btn-primary" type="submit">Activate</button>
            </form>
            {lastActivated && (
              <div className="hint mt-2.5">
                Last activated: <span className="lt-mono">{lastActivated.token}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="lt-table">
            <thead><tr><th>Token</th><th>Batch</th><th>Product</th><th>Activated</th><th>Activated by</th></tr></thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td className="lt-mono">{h.token}</td>
                  <td className="lt-mono">{h.batch}</td>
                  <td>{h.product}</td>
                  <td>{h.when ? new Date(h.when).toLocaleString() : "—"}</td>
                  <td>{h.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && <div className="p-8 text-center text-muted text-sm">No activations yet.</div>}
        </div>
      )}
      <Toast toast={toast} />
    </>
  );
}
