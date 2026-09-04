import React, { useEffect, useState } from "react";
import { Download, FileWarning } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import PageHead from "../components/PageHead";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import Field from "../components/Field";
import Toast from "../components/Toast";
import useToast from "../components/useToast";

export default function CsvDownloads() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestFor, setRequestFor] = useState(null);
  const [reason, setReason] = useState("");
  const [toast, fireToast] = useToast();
  const canDirectDownload = user?.systemRole === "admin" || user?.systemRole === "manufacturer";

  function load() {
    setLoading(true);
    client.get("/csv/exports").then((res) => setRows(res.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function download(row) {
    try {
      const res = await client.post(`/csv/exports/${row.id}/download`);
      const csv = await client.get(`/labels/${res.data.batch}/csv`, { responseType: "blob" });
      const url = URL.createObjectURL(csv.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${res.data.batch}-codes.csv`;
      a.click();
      URL.revokeObjectURL(url);
      fireToast(`Downloading CSV for ${row.batch}…`);
      load();
    } catch (e) {
      fireToast(e.message, "err");
    }
  }

  async function submitRequest() {
    if (!reason.trim()) return;
    try {
      await client.post(`/csv/exports/${requestFor.id}/request-redownload`, { reason });
      fireToast("Redownload request submitted for Admin review.");
      setRequestFor(null);
      setReason("");
    } catch (e) {
      fireToast(e.message, "err");
    }
  }

  return (
    <>
      <PageHead title="CSV downloads"
        desc={canDirectDownload ? "Download any previously generated export directly, at any time." : "Download exports from batches you generated. Redownloading an older export needs Admin approval."} />
      <div className="card table-wrap">
        <table className="lt-table">
          <thead><tr><th>Batch number</th><th>Product ID</th><th>Manufacturer</th><th>Generated</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {!loading && rows.map((r) => (
              <tr key={r.id}>
                <td className="lt-mono">{r.batch}</td>
                <td className="lt-mono">{r.productId}</td>
                <td>{r.manufacturer}</td>
                <td>{r.date ? r.date.slice(0, 10) : "—"}</td>
                <td><Badge status={r.status} /></td>
                <td>
                  {r.canDownloadNow
                    ? <button className="btn btn-outline btn-sm" onClick={() => download(r)}><Download size={13} /> Download</button>
                    : <button className="btn btn-ghost btn-sm" onClick={() => setRequestFor(r)}><FileWarning size={13} /> Request redownload</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <div className="p-8 text-center text-muted text-sm">No exports yet.</div>}
      </div>

      {requestFor && (
        <Modal title="Request redownload" onClose={() => setRequestFor(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setRequestFor(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitRequest}>Submit request</button>
          </>}>
          <div className="kv-row"><span className="kv-label">Batch number</span><span className="kv-val lt-mono">{requestFor.batch}</span></div>
          <div className="kv-row"><span className="kv-label">Product ID</span><span className="kv-val lt-mono">{requestFor.productId}</span></div>
          <div className="mt-4">
            <Field label="Reason for request" hint="Required. Your Admin reviews this before the export is made available again.">
              <textarea className="input" rows={3} placeholder="e.g. Original export corrupted during transfer to print vendor." value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
          </div>
        </Modal>
      )}
      <Toast toast={toast} />
    </>
  );
}
