import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import client from "../api/client";
import PageHead from "../components/PageHead";
import Badge from "../components/Badge";
import Toast from "../components/Toast";
import useToast from "../components/useToast";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, fireToast] = useToast();

  function load() {
    setLoading(true);
    client.get("/users").then((res) => setUsers(res.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function toggle(u) {
    try {
      await client.post(`/users/${u.id}/toggle-status`);
      load();
    } catch (e) {
      fireToast(e.message, "err");
    }
  }

  return (
    <>
      <PageHead title="Users" desc="Every account with access to LabelTrack, and the role assigned to it."
        action={<button className="btn btn-primary" onClick={() => navigate("/users/new")}><Plus size={15} /> Add user</button>} />
      <div className="card table-wrap">
        <table className="lt-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Manufacturer</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {!loading && users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.manufacturer}</td>
                <td><Badge status={u.status} /></td>
                <td>
                  <button className="row-link" onClick={() => navigate(`/users/${u.id}/edit`)}>Edit</button>
                  <span className="mx-1.5 text-line-strong">·</span>
                  <button className="row-link" onClick={() => toggle(u)}>{u.status === "Active" ? "Deactivate" : "Activate"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && users.length === 0 && <div className="p-8 text-center text-muted text-sm">No users yet.</div>}
      </div>
      <Toast toast={toast} />
    </>
  );
}
