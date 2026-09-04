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
  const permOk = resourceKey === "setup"
    ? user.systemRole === "admin"
    : user.systemRole === "admin" || (user.permissions || []).includes(resourceKey);

  if (!roleOk || !permOk) return <Navigate to="/access-denied" replace />;
  return children;
}
