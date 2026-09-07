import React, { useEffect, useState } from "react";
import { Plus, Factory } from "lucide-react";
import client from "../api/client";
import PageHead from "../components/PageHead";
import Modal from "../components/Modal";
import Field from "../components/Field";
import Segmented from "../components/Segmented";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import useToast from "../components/useToast";

const CODE_TYPES = ["QR Code", "Barcode", "Both"];
const GENERATION_LEVELS = ["Batch-level", "Unit-level"];

function ManufacturerFormModal({ title, manufacturer, onClose, onSave }) {
  const [name, setName] = useState(manufacturer?.name || "");
  const [codeType, setCodeType] = useState(manufacturer?.defaultCodeType || "Both");
  const [generationLevel, setGenerationLevel] = useState(manufacturer?.defaultGenerationLevel || "Unit-level");
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim()) { setError("Manufacturer name is required."); return; }
    try {
      await onSave({ name: name.trim(), defaultCodeType: codeType, defaultGenerationLevel: generationLevel });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Modal title={title} width={480} onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save manufacturer</button>
      </>}>
      <Field label="Manufacturer name" error={error}>
        <input className="input" placeholder="e.g. Kaveri Lubricants Pvt Ltd" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <div className="field">
        <label>Default code type</label>
        <Segmented options={CODE_TYPES} value={codeType} onChange={setCodeType} />
        <div className="hint mt-1.5">Used as the starting choice on Label Generation for this manufacturer's batches.</div>
      </div>
      <div className="field">
        <label>Default generation level</label>
        <Segmented options={GENERATION_LEVELS} value={generationLevel} onChange={setGenerationLevel} />
        <div className="hint mt-1.5">Batch-level mints one code per batch; Unit-level mints one per unit.</div>
      </div>
    </Modal>
  );
}

function DeleteConfirmModal({ manufacturer, onClose, onConfirm }) {
  const [error, setError] = useState("");
  const blocked = manufacturer.productsCount > 0 || manufacturer.usersCount > 0;

  async function handleConfirm() {
    try {
      await onConfirm();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Modal title="Delete manufacturer" onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" disabled={blocked} onClick={handleConfirm}>Delete</button>
      </>}>
      <div className="kv-row"><span className="kv-label">Manufacturer</span><span className="kv-val">{manufacturer.name}</span></div>
      <div className="kv-row"><span className="kv-label">Products</span><span className="kv-val">{manufacturer.productsCount}</span></div>
      <div className="kv-row"><span className="kv-label">Users</span><span className="kv-val">{manufacturer.usersCount}</span></div>
      {blocked ? (
        <div className="err mt-3">This manufacturer still has products and/or users attached — reassign or remove them first.</div>
      ) : (
        <div className="hint mt-3">This can't be undone.</div>
      )}
      {error && <div className="err mt-2">{error}</div>}
    </Modal>
  );
}

export default function Manufacturers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, fireToast] = useToast();

  function load() {
    setLoading(true);
    client.get("/manufacturers").then((res) => setRows(res.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function saveNew(form) {
    const res = await client.post("/manufacturers", form);
    setRows((rs) => [...rs, res.data].sort((a, b) => a.name.localeCompare(b.name)));
    setShowCreate(false);
    fireToast(`${res.data.name} added.`);
  }

  async function saveEdited(id, form) {
    const res = await client.put(`/manufacturers/${id}`, form);
    setRows((rs) => rs.map((r) => (r.id === id ? res.data : r)));
    setEditing(null);
    fireToast(`${res.data.name} updated.`);
  }

  async function confirmDelete() {
    await client.delete(`/manufacturers/${deleting.id}`);
    setRows((rs) => rs.filter((r) => r.id !== deleting.id));
    fireToast(`${deleting.name} deleted.`);
    setDeleting(null);
  }

  return (
    <>
      <PageHead eyebrow="Admin only" title="Manufacturers" desc="Every manufacturer organization on the platform, and their default label settings."
        action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Add manufacturer</button>} />

      {!loading && rows.length === 0 ? (
        <div className="card"><EmptyState icon={Factory} title="No manufacturers yet" desc="Add the first manufacturer to start creating products and batches for them." /></div>
      ) : (
        <div className="card table-wrap">
          <table className="lt-table">
            <thead><tr><th>Name</th><th>Code type</th><th>Generation level</th><th>Products</th><th>Users</th><th></th></tr></thead>
            <tbody>
              {!loading && rows.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.defaultCodeType}</td>
                  <td>{m.defaultGenerationLevel}</td>
                  <td>{m.productsCount}</td>
                  <td>{m.usersCount}</td>
                  <td>
                    <button className="row-link" onClick={() => setEditing(m)}>Edit</button>
                    <span className="mx-1.5 text-line-strong">·</span>
                    <button className="row-link text-red" onClick={() => setDeleting(m)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <ManufacturerFormModal title="Add manufacturer" onClose={() => setShowCreate(false)} onSave={saveNew} />}
      {editing && (
        <ManufacturerFormModal title={`Edit — ${editing.name}`} manufacturer={editing} onClose={() => setEditing(null)}
          onSave={(form) => saveEdited(editing.id, form)} />
      )}
      {deleting && <DeleteConfirmModal manufacturer={deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />}
      <Toast toast={toast} />
    </>
  );
}
