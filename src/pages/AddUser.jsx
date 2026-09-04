import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import PageHead from "../components/PageHead";
import Field from "../components/Field";
import PermissionsField from "../components/PermissionsField";

const ALL_ROLES = ["Admin", "Manufacturer", "Employee"];

export default function AddUser() {
  const { user: acting } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const restricted = acting?.systemRole === "manufacturer";
  const editing = Boolean(id);

  const availableRoles = restricted ? ["Employee"] : ALL_ROLES;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(restricted ? "Employee" : "Manufacturer");
  const [manufacturerId, setManufacturerId] = useState(restricted ? acting.manufacturerId : "");
  const [manufacturers, setManufacturers] = useState([]);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState("");

  // Admin needs a manufacturer picker when the role is Manufacturer/Employee
  // (Manufacturer-role actors are already scoped to their own org).
  useEffect(() => {
    if (!restricted) {
      client.get("/setup/manufacturers").then((res) => setManufacturers(res.data)).catch(() => {});
    }
  }, [restricted]);

  useEffect(() => {
    if (!editing) return;
    client.get("/users").then((res) => {
      const u = res.data.find((x) => x.id === id);
      if (u) {
        setName(u.name); setEmail(u.email); setRole(u.role); setPermissions(u.permissions || []);
        setManufacturerId(u.manufacturerId || "");
      }
    });
  }, [id, editing]);

  // Pull DB-backed role defaults whenever the role changes — only when
  // creating, so we don't clobber an existing user's saved permissions.
  useEffect(() => {
    if (editing || !role) return;
    client.get(`/permissions/role-defaults?role=${encodeURIComponent(role)}`).then((res) => setPermissions(res.data.permissions));
  }, [role, editing]);

  async function save() {
    if (!name.trim() || !email.trim() || !role.trim()) { setError("Name, email, and role are required."); return; }
    if (!editing && !password) { setError("Set a password for this account."); return; }
    if (restricted && role !== "Employee") {
      setError("Admin and Manufacturer roles must be created by an Admin."); return;
    }
    if (!restricted && role !== "Admin" && !manufacturerId) {
      setError("Select which manufacturer this account belongs to."); return;
    }
    setError("");
    try {
      const payload = { name, email, role, permissions, password: password || undefined };
      if (!restricted && role !== "Admin") payload.manufacturerId = manufacturerId;
      if (editing) {
        await client.put(`/users/${id}`, payload);
      } else {
        await client.post("/users", payload);
      }
      navigate("/users");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <PageHead eyebrow="Users" title={editing ? "Edit user" : "Add user"}
        desc={editing
          ? "Update this account's details, credentials, and the pages visible in their sidebar."
          : (restricted ? "Create an account at your organization. Admin and Manufacturer roles aren't available here." : "Create a standalone account. They'll sign in with the email and password set here.")} />
      <div className="card" style={{ maxWidth: 560 }}>
        <Field label="Username or email"><input className="input" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Full name"><input className="input" placeholder="e.g. Priya Nair" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Password" hint={editing ? "Leave blank to keep the current password." : "The person will sign in with this email and password."}>
          <div className="relative">
            <input className="input pr-10" type={showPw ? "text" : "password"} placeholder={editing ? "••••••••" : "Set a password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-faint p-1" onClick={() => setShowPw((s) => !s)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Field label="Role" hint={restricted ? "Admin and Manufacturer can only be created by an Admin." : "Only Admin, Manufacturer, and Employee are valid roles."} error={error}>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)} disabled={editing && restricted}>
            {availableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        {!restricted && role !== "Admin" && (
          <Field label="Manufacturer" hint="Determines which manufacturer's data this account is scoped to — and which manufacturer's default permissions apply.">
            <select className="input" value={manufacturerId} onChange={(e) => setManufacturerId(e.target.value)}>
              <option value="">Select a manufacturer…</option>
              {manufacturers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
        )}
        <PermissionsField selected={permissions} onChange={setPermissions} />
        <div className="flex gap-2.5 mt-2">
          <button className="btn btn-outline" onClick={() => navigate("/users")}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>{editing ? "Save changes" : "Save user"}</button>
        </div>
      </div>
    </>
  );
}
