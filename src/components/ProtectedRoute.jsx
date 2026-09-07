import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Mirrors ROLE_ALLOWED from the backend/mock — which system roles may
// even attempt a given page, independent of the granted-permissions list.
const ROLE_ALLOWED = {
  dashboard: ["admin", "manufacturer"],
  users: ["admin", "manufacturer"],
  products: ["admin", "manufacturer", "employee"],
  labelGeneration: ["admin", "manufacturer"],
  dispatchConsole: ["admin", "manufacturer"],
  batches: ["admin", "manufacturer"],
  recalls: ["admin", "manufacturer"],
  csvDownloads: ["admin", "manufacturer", "employee"],
  csvRequests: ["admin"],
  setup: ["admin"],
};

export default function ProtectedRoute({ resourceKey, children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;

  const allowedRoles = ROLE_ALLOWED[resourceKey];
  const roleOk = !allowedRoles || allowedRoles.includes(user.systemRole);
  // TEMPORARY: manufacturer bypasses the granted-permissions check the
  // same way admin does, so Manufacturer accounts can reach every page
  // their role is allowed to (per ROLE_ALLOWED above) even with an
  // empty/misconfigured permissions list. Admin-only pages (setup) are
  // unaffected. Remove "manufacturer" here once real permissions are
  // assigned to every Manufacturer account.
  const permOk = resourceKey === "setup"
    ? user.systemRole === "admin"
    : user.systemRole === "admin" || user.systemRole === "manufacturer" || (user.permissions || []).includes(resourceKey);

  if (!roleOk || !permOk) return <Navigate to="/access-denied" replace />;
  return children;
}