import React, { useEffect, useState } from "react";
import { Plus, Tag } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import PageHead from "../components/PageHead";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import Field from "../components/Field";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import useToast from "../components/useToast";

function CategoryFormModal({ title, category, onClose, onSave }) {
  const [name, setName] = useState(category?.name || "");
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim()) { setError("Category name is required."); return; }
    try {
      await onSave({ name: name.trim() });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Modal title={title} onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save category</button>
      </>}>
      <Field label="Category name" error={error}>
        <input className="input" placeholder="e.g. Engine Oil" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
    </Modal>
  );
}

function DeleteConfirmModal({ category, onClose, onConfirm }) {
  const [error, setError] = useState("");

  async function handleConfirm() {
    try {
      await onConfirm();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Modal title="Delete category" onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={handleConfirm}>Delete permanently</button>
      </>}>
      <div className="kv-row"><span className="kv-label">Category</span><span className="kv-val">{category.name}</span></div>
      <div className="hint mt-3">
        This removes the category entirely and can't be undone — blocked if any product still uses it.
        To just hide it from new product assignments without losing history, use Deactivate instead.
      </div>
      {error && <div className="err mt-2">{error}</div>}
    </Modal>
  );
}

export default function Categories() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, fireToast] = useToast();
  const canEdit = user?.systemRole !== "employee";

  function load() {
    setLoading(true);
    client.get("/categories").then((res) => setRows(res.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function saveNew(form) {
    const res = await client.post("/categories", form);
    setRows((rs) => [...rs, res.data].sort((a, b) => a.name.localeCompare(b.name)));
    setShowCreate(false);
    fireToast(`${res.data.name} added.`);
  }

  async function saveEdited(id, form) {
    const res = await client.put(`/categories/${id}`, form);
    setRows((rs) => rs.map((r) => (r.id === id ? res.data : r)));
    setEditing(null);
    fireToast(`${res.data.name} updated.`);
  }

  async function toggleStatus(category) {
    try {
      const res = await client.post(`/categories/${category.id}/toggle-status`);
      setRows((rs) => rs.map((r) => (r.id === category.id ? res.data : r)));
      fireToast(res.data.status === "ACTIVE" ? `${res.data.name} activated.` : `${res.data.name} deactivated.`);
    } catch (e) {
      fireToast(e.message, "err");
    }
  }

  async function confirmDelete() {
    await client.delete(`/categories/${deleting.id}`);
    setRows((rs) => rs.filter((r) => r.id !== deleting.id));
    fireToast(`${deleting.name} deleted.`);
    setDeleting(null);
  }

  return (
    <>
      <PageHead title="Categories" desc={!canEdit ? "View-only access to product categories." : "Every product is assigned one of these categories."}
        action={canEdit && <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Add category</button>} />

      {!loading && rows.length === 0 ? (
        <div className="card"><EmptyState icon={Tag} title="No categories yet" desc="Add the first category so products can be assigned to it." /></div>
      ) : (
        <div className="card table-wrap">
          <table className="lt-table">
            <thead><tr><th>Name</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {!loading && rows.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td><Badge status={c.status === "ACTIVE" ? "Active" : "Inactive"} /></td>
                  <td>
                    {canEdit && (
                      <>
                        <button className="row-link" onClick={() => setEditing(c)}>Edit</button>
                        <span className="mx-1.5 text-line-strong">·</span>
                        <button className="row-link" onClick={() => toggleStatus(c)}>
                          {c.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </button>
                        <span className="mx-1.5 text-line-strong">·</span>
                        <button className="row-link text-red" onClick={() => setDeleting(c)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CategoryFormModal title="Add category" onClose={() => setShowCreate(false)} onSave={saveNew} />}
      {editing && (
        <CategoryFormModal title={`Edit — ${editing.name}`} category={editing} onClose={() => setEditing(null)}
          onSave={(form) => saveEdited(editing.id, form)} />
      )}
      {deleting && <DeleteConfirmModal category={deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />}
      <Toast toast={toast} />
    </>
  );
}
