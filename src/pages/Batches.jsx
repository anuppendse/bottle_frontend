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
      <div className="kv-row">
        <span className="kv-label">Product name</span>
        <span className="kv-val">{batch.productName}</span>
      </div>
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
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [toast, fireToast] = useToast();
  const canRecall = user?.systemRole === "admin" || (user?.permissions || []).includes("batches.recall");

  function load() {
  setLoading(true);

  const params = new URLSearchParams();

  if (statusFilter !== "ALL") {
    params.append("status", statusFilter);
  }

  if (search.trim()) {
  params.append("search", search.trim());
}

  const query = params.toString();

  client
    .get(`/batches${query ? `?${query}` : ""}`)
    .then((res) => setBatches(res.data))
    .finally(() => setLoading(false));
  }

  async function activateBatch(batch) {
    try {
      const res = await client.post("/dispatch/activate", {
        batch: batch.batch,
      });

      fireToast(
        res.data?.message || "Batch activated successfully."
      );

      load();
    } catch (err) {
      fireToast(
        err.response?.data?.error ||
        err.message ||
        "Failed to activate batch."
      );
    }
  }

  async function confirmRecall(reason) {
  if (!recallTarget) return;

  try {
    const res = await client.post(
      `/batches/${recallTarget.batch}/recall`,
      { reason }
    );

    setRecallTarget(null);
    fireToast(res.data?.message || "Batch recalled successfully.");
    load();
  } catch (err) {
    throw new Error(
      err.response?.data?.error || err.message
    );
  }
}
  useEffect(() => {
  load();
  }, [statusFilter, search]);


  return (
    <>
      <PageHead title="Batch management" desc="Every batch generated for a product, with its current status."
      action={
        <div className="flex gap-2 items-center">
          <input className="input" type="text" placeholder="Search batch no. or product name.." value={search} onChange={(e) => setSearch(e.target.value)}/>
          
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="IN PRODUCTION">In Production</option>
            <option value="RECALLED">Recalled</option>
            <option value="EXPIRED">Expired</option>
            </select>
            </div>
            }
            />

      <div className="card table-wrap">
        <table className="lt-table">
          <thead><tr><th>Batch</th><th>Product name</th><th>Level</th><th>Mfg date</th><th>Expiry date</th><th>Qty</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {!loading && batches.map((b) => (
              <tr key={b.batch}>
                <td className="lt-mono"><button className="row-link" onClick={() => navigate(`/batches/${b.batch}`)}>{b.batch.slice(0, 8)}…</button></td>
                <td>{b.productName}</td>
                <td className="capitalize">{b.generationLevel === "BATCH" ? "Batch" : "Unit"}</td>
                <td>{b.mfg}</td>
                <td>{b.expiry}</td>
                <td>{b.qty.toLocaleString()}</td>
                <td><Badge status={b.displayStatus} /></td>
                {/* <td>{b.created ? b.created.slice(0, 10) : "—"}</td> */}
                <td>
                  <div className="flex gap-2 items-center">
                    <button className="row-link" onClick={() => navigate(`/batches/${b.batch}`)}> View → </button>
                    {b.status === "IN PRODUCTION" && (
                      <button className="btn btn-outline btn-sm" onClick={() => activateBatch(b)} > Activate </button> )}
                    {b.status === "ACTIVE" && canRecall && (
                      <button className="btn btn-outline btn-sm" onClick={() => setRecallTarget(b)}> Recall </button>
                      )}
                    </div>
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
