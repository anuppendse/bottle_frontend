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
import { useAuth } from "../context/AuthContext";
import { ACTIONS } from "../permissions/permissions";
import Badge from "../components/Badge";

const CODE_TYPES = ["QR", "BARCODE", "BOTH"];
const GENERATION_LEVELS = ["BATCH", "UNIT"];

const STATUS_ACTIVE = "ACTIVE";
const STATUS_INACTIVE = "INACTIVE";

function isActive(m) {
  return String(m.status || STATUS_ACTIVE).toUpperCase() === STATUS_ACTIVE;
}

function ManufacturerFormModal({ title, manufacturer, onClose, onSave }) {
  const [name, setName] = useState(manufacturer?.name || "");
  const [codeType, setCodeType] = useState(manufacturer?.codeType || "BOTH");
  const [generationLevel, setGenerationLevel] = useState(manufacturer?.generationLevel || "UNIT");
  const [companyName, setCompanyName] = useState(manufacturer?.companyName || "");
  const [gstin, setGstin] = useState(manufacturer?.gstin || "");
  const [contactEmail, setContactEmail] = useState(manufacturer?.contactEmail || "");
  const [contactPhone, setContactPhone] = useState(manufacturer?.contactPhone || "");
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim()) { setError("Manufacturer name is required."); return; }
    try {
      await onSave({
        name: name.trim(),
        codeType,
        generationLevel,
        companyName: companyName.trim() || null,
        gstin: gstin.trim() || null,
        contactEmail: contactEmail.trim() || null,
        contactPhone: contactPhone.trim() || null,
      });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Modal title={title} width={520} onClose={onClose}
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
      </div>
      <div className="field">
        <label>Default generation level</label>
        <Segmented options={GENERATION_LEVELS} value={generationLevel} onChange={setGenerationLevel} />
      </div>

      <div className="grid grid-cols-2 gap-x-5">
        <Field label="Company name">
          <input className="input" placeholder="Legal company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </Field>
        <Field label="GSTIN">
          <input className="input lt-mono" placeholder="e.g. 27AACCK1234F1Z5" value={gstin} onChange={(e) => setGstin(e.target.value)} />
        </Field>
        <Field label="Contact email">
          <input className="input" placeholder="ops@company.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </Field>
        <Field label="Contact phone">
          <input className="input" placeholder="+91 20 1234 5678" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

function StatusConfirmModal({ manufacturer, onClose, onConfirm }) {
  const [error, setError] = useState("");
  const active = isActive(manufacturer);
  // Only block when inactivating; activating is always allowed.
  const blocked = active && (manufacturer.productsCount > 0 || manufacturer.usersCount > 0);

  async function handleConfirm() {
    try {
      await onConfirm();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Modal title={active ? "Inactivate manufacturer" : "Activate manufacturer"} onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className={active ? "btn btn-danger" : "btn btn-primary"} disabled={blocked} onClick={handleConfirm}>
          {active ? "Inactivate" : "Activate"}
        </button>
      </>}>
      <div className="kv-row"><span className="kv-label">Manufacturer</span><span className="kv-val">{manufacturer.name}</span></div>
      <div className="kv-row"><span className="kv-label">Current status</span><span className="kv-val">{active ? "Active" : "Inactive"}</span></div>
      <div className="kv-row"><span className="kv-label">Products</span><span className="kv-val">{manufacturer.productsCount ?? 0}</span></div>
      <div className="kv-row"><span className="kv-label">Users</span><span className="kv-val">{manufacturer.usersCount ?? 0}</span></div>
      {blocked ? (
        <div className="err mt-3">This manufacturer still has products and/or users attached — reassign or remove them first.</div>
      ) : (
        <div className="hint mt-3">
          {active ? "You can activate this manufacturer again at any time." : "This manufacturer will become active again."}
        </div>
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
  const [togglingStatus, setTogglingStatus] = useState(null);
  const [toast, fireToast] = useToast();
  const { can } = useAuth();
  const canAdd = can(ACTIONS.MANUFACTURER_ADD);
  const canEdit = can(ACTIONS.MANUFACTURER_EDIT);
  const canInactive = can(ACTIONS.MANUFACTURER_DELETE);

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

  async function confirmStatusChange() {
    const target = togglingStatus;
    const newStatus = isActive(target) ? STATUS_INACTIVE : STATUS_ACTIVE;
    const res = await client.post(`/manufacturers/${target.id}/status`, { status: newStatus });
    const updatedStatus = res.data?.status || newStatus;
    setRows((rs) => rs.map((r) => (r.id === target.id ? { ...r, status: updatedStatus } : r)));
    fireToast(`${target.name} ${newStatus === STATUS_ACTIVE ? "activated" : "inactivated"}.`);
    setTogglingStatus(null);
  }

  return (
    <>
      <PageHead eyebrow="Admin only" title="Manufacturers" desc="Every manufacturer organization on the platform, and their default label + contact details."
        action={canAdd && <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Add manufacturer</button>} />

      {!loading && rows.length === 0 ? (
        <div className="card"><EmptyState icon={Factory} title="No manufacturers yet" desc="Add the first manufacturer to start creating products and batches for them." /></div>
      ) : (
        <div className="card table-wrap">
          <table className="lt-table">
            <thead><tr><th>Name</th><th>Company name</th><th>Code type</th><th>Generation level</th><th>Status</th><th>Contact</th><th></th></tr></thead>
            <tbody>
              {!loading && rows.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.companyName || "—"}</td>
                  <td>{m.codeType}</td>
                  <td>{m.generationLevel}</td>
                  <td><Badge status={isActive(m) ? "Active" : "Inactive"}/></td>
                  <td>{m.contactEmail || m.contactPhone || "—"}</td>
                  <td>
                    {canEdit && <button className="row-link" onClick={() => setEditing(m)}>Edit</button>}
                    {canEdit && canInactive && <span className="mx-1.5 text-line-strong">·</span>}
                    {canInactive && (
                      <button className={isActive(m) ? "row-link" : "row-link"} onClick={() => setTogglingStatus(m)}>
                        {isActive(m) ? "Inactivate" : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && canAdd && <ManufacturerFormModal title="Add manufacturer" onClose={() => setShowCreate(false)} onSave={saveNew} />}
      {editing && canEdit && (
        <ManufacturerFormModal title={`Edit — ${editing.name}`} manufacturer={editing} onClose={() => setEditing(null)}
          onSave={(form) => saveEdited(editing.id, form)} />
      )}
      {togglingStatus && canInactive && (
        <StatusConfirmModal manufacturer={togglingStatus} onClose={() => setTogglingStatus(null)} onConfirm={confirmStatusChange} />
      )}
      <Toast toast={toast} />
    </>
  );
}
