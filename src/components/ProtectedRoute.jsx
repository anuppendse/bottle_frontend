import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Page-level guard. Uses the DB-driven permission checker (see
// src/permissions/permissions.js): role ceiling + granted permission
// (+ parent granted for sub-pages). No role bypasses.
export default function ProtectedRoute({ resourceKey, children }) {
  const { user, ready, can } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (resourceKey && !can(resourceKey)) return <Navigate to="/access-denied" replace />;
  return children;
}
