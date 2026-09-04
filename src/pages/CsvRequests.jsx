import React, { useEffect, useState } from "react";
import client from "../api/client";
import PageHead from "../components/PageHead";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import Field from "../components/Field";
import Toast from "../components/Toast";
import useToast from "../components/useToast";

export default function CsvRequests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteFor, setNoteFor] = useState(null);
  const [note, setNote] = useState("");
  const [toast, fireToast] = useToast();

  function load() {
    setLoading(true);
    client.get("/csv/requests").then((res) => setRows(res.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function decide(id, status, reviewNote) {
    try {
      await client.post(`/csv/requests/${id}/decide`, { status, note: reviewNote });
      fireToast(status === "Approved" ? "Request approved — CSV made available to requester." : "Request rejected.");
      setNoteFor(null);
      setNote("");
      load();
    } catch (e) {
      fireToast(e.message, "err");
    }
  }

  return (
    <>
      <PageHead title="CSV redownload requests" desc="Only Admin can approve a request to redownload a previously generated export." />
      <div className="card table-wrap">
        <table className="lt-table">
          <thead><tr><th>Request</th><th>Requested by</th><th>Role</th><th>Batch</th><th>Reason</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {!loading && rows.map((r) => (
              <tr key={r.id}>
                <td className="lt-mono">{r.id}</td>
                <td>{r.requestedBy}</td>
                <td>{r.role}</td>
                <td className="lt-mono">{r.batch}</td>
                <td style={{ maxWidth: 240 }}>{r.reason}</td>
                <td>{r.date ? r.date.slice(0, 10) : "—"}</td>
                <td><Badge status={r.status} /></td>
                <td>
                  {r.status === "Pending" ? (
                    <div className="flex gap-1.5">
                      <button className="btn btn-outline btn-sm" onClick={() => decide(r.id, "Approved")}>Approve</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setNoteFor(r)}>Reject</button>
                    </div>
                  ) : <span className="text-faint text-xs">Reviewed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <div className="p-8 text-center text-muted text-sm">No requests yet.</div>}
      </div>
      {noteFor && (
        <Modal title="Reject request" onClose={() => setNoteFor(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setNoteFor(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => decide(noteFor.id, "Rejected", note)}>Reject request</button>
          </>}>
          <Field label="Note to requester (optional)">
            <textarea className="input" rows={3} placeholder="Let them know why, and what to do instead." value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </Modal>
      )}
      <Toast toast={toast} />
    </>
  );
}
