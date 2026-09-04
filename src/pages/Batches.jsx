import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, AlertTriangle } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import PageHead from "../components/PageHead";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import Field from "../components/Field";
import Toast from "../components/Toast";
import useToast from "../components/useToast";

function RecallModal({ batch, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function confirm() {
    if (!reason.trim()) { setError("Reason for recall is required."); return; }
    try {
      await onConfirm(reason);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Modal title="Recall batch" onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={confirm}><AlertTriangle size={14} /> Confirm recall</button>
      </>}>
      <div className="kv-row"><span className="kv-label">Batch number</span><span className="kv-val lt-mono">{batch.batch}</span></div>
      <div className="kv-row"><span className="kv-label">Product ID</span><span className="kv-val lt-mono">{batch.productId}</span></div>
      <div className="kv-row"><span className="kv-label">Product name</span><span className="kv-val">{batch.productName}</span></div>
      <div className="mt-4">
        <Field label="Reason for recall" hint="Required — this is recorded against the batch and shown wherever it appears." error={error}>
          <textarea className="input" rows={3} placeholder="e.g. Viscosity out of spec detected in QA retest." value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

export default function Batches() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recallTarget, setRecallTarget] = useState(null);
  const [toast, fireToast] = useToast();
  const canRecall = user?.systemRole === "admin" || (user?.permissions || []).includes("batches.recall");

  function load() {
    setLoading(true);
    client.get("/batches").then((res) => setBatches(res.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function confirmRecall(reason) {
    await client.post(`/batches/${recallTarget.batch}/recall`, { reason });
    fireToast(`Batch ${recallTarget.batch} recalled.`);
    setRecallTarget(null);
    load();
  }

  return (
    <>
      <PageHead title="Batch management" desc="Every batch generated for a product, with its current status."
        action={<button className="btn btn-ghost btn-sm"><Filter size={14} /> More filters</button>} />
      <div className="card table-wrap">
        <table className="lt-table">
          <thead><tr><th>Batch</th><th>Product name</th><th>Level</th><th>Mfg date</th><th>Expiry date</th><th>Qty</th><th>Status</th><th>Created</th><th></th></tr></thead>
          <tbody>
            {!loading && batches.map((b) => (
              <tr key={b.batch}>
                <td className="lt-mono"><button className="row-link" onClick={() => navigate(`/batches/${b.batch}`)}>{b.batch.slice(0, 8)}…</button></td>
                <td>{b.productName}</td>
                <td className="capitalize">{b.generationLevel}</td>
                <td>{b.mfg}</td>
                <td>{b.expiry}</td>
                <td>{b.qty.toLocaleString()}</td>
                <td><Badge status={b.displayStatus} /></td>
                <td>{b.created ? b.created.slice(0, 10) : "—"}</td>
                <td>
                  {b.status === "ACTIVE" && canRecall
                    ? <button className="btn btn-outline btn-sm" onClick={() => setRecallTarget(b)}>Recall</button>
                    : <button className="row-link" onClick={() => navigate(`/batches/${b.batch}`)}>View →</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && batches.length === 0 && <div className="p-8 text-center text-muted text-sm">No batches yet.</div>}
      </div>

      {recallTarget && <RecallModal batch={recallTarget} onClose={() => setRecallTarget(null)} onConfirm={confirmRecall} />}
      <Toast toast={toast} />
    </>
  );
}
