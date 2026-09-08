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

export default function Categories() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
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
      <Toast toast={toast} />
    </>
  );
}
