import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import PageHead from "../components/PageHead";
import Modal from "../components/Modal";
import Field from "../components/Field";
import Toast from "../components/Toast";
import useToast from "../components/useToast";

function ProductFormModal({ title, product, categories, onClose, onSave }) {
  const [name, setName] = useState(product?.name || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || categories[0]?.id || "");
  const [desc, setDesc] = useState(product?.desc || "");
  const [shelfLifeMonths, setShelfLifeMonths] = useState(product?.shelfLifeMonths || "");
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim()) { setError("Product name is required."); return; }
    if (!categoryId) { setError("Select a category."); return; }
    if (!shelfLifeMonths || Number(shelfLifeMonths) <= 0) { setError("Enter a valid shelf life in months."); return; }
    try {
      await onSave({ name, categoryId, desc, shelfLifeMonths: Number(shelfLifeMonths) });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Modal title={title} width={560} onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save product</button>
      </>}>
      <div className="grid grid-cols-2 gap-x-5">
        <div className="col-span-2">
          <Field label="Product name">
            <input className="input" placeholder="e.g. SynthoShield 10W-30 Engine Oil" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
        </div>
        <Field label="Category">
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Shelf life (months)" hint="Owned directly by the product — no manufacturer fallback.">
          <input className="input" type="number" placeholder="e.g. 24" value={shelfLifeMonths} onChange={(e) => setShelfLifeMonths(e.target.value)} />
        </Field>
        <div className="col-span-2">
          <Field label="Description" error={error}>
            <textarea className="input" rows={3} placeholder="Short description shown in the product detail view" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, fireToast] = useToast();
  const canEdit = user?.systemRole !== "employee";

  function load() {
    setLoading(true);
    Promise.all([client.get("/products"), client.get("/categories")])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function saveNewProduct(form) {
    const res = await client.post("/products", form);
    setProducts((ps) => [res.data, ...ps]);
    setShowCreate(false);
    fireToast(`Product ${res.data.id.slice(0, 8)} created.`);
  }

  async function saveEditedProduct(id, form) {
    const res = await client.put(`/products/${id}`, form);
    setProducts((ps) => ps.map((p) => (p.id === id ? res.data : p)));
    setEditing(null);
    fireToast("Product updated.");
  }

  return (
    <>
      <PageHead
        title="Products"
        desc={!canEdit ? "View-only access to the product catalog." : "Every product must have a category and its own shelf life before batches or labels can be created against it."}
        action={canEdit && <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Add product</button>}
      />
      <div className="card table-wrap">
        <table className="lt-table">
          <thead><tr><th>Name</th><th>Category</th><th>First batch</th><th>Last batch</th><th>Shelf life</th><th></th></tr></thead>
          <tbody>
            {!loading && products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td className="lt-mono">{p.firstBatch === "—" ? "—" : p.firstBatch.slice(0, 8)}</td>
                <td className="lt-mono">{p.lastBatch === "—" ? "—" : p.lastBatch.slice(0, 8)}</td>
                <td>{p.shelfLifeMonths} months</td>
                <td>{canEdit && <button className="row-link" onClick={() => setEditing(p)}>Edit →</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && products.length === 0 && <div className="p-8 text-center text-muted text-sm">No products yet.</div>}
      </div>

      {showCreate && <ProductFormModal title="Add product" categories={categories} onClose={() => setShowCreate(false)} onSave={saveNewProduct} />}
      {editing && (
        <ProductFormModal title={`Edit product — ${editing.name}`} product={editing} categories={categories} onClose={() => setEditing(null)}
          onSave={(form) => saveEditedProduct(editing.id, form)} />
      )}
      <Toast toast={toast} />
    </>
  );
}
