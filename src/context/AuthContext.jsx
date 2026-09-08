import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

// The backend's Role enum values are now uppercase ("ADMIN",
// "MANUFACTURER", "EMPLOYEE") and User.to_dict() returns them as-is in
// `role`/`systemRole` (no longer run through normalize_role() there).
// Every frontend check compares `systemRole` against lowercase strings
// ("admin"/"manufacturer"/"employee"), so without this normalization
// every one of those checks silently fails — including the
// `landing[user.systemRole]` lookup in App.jsx's RootRedirect, which
// then renders <Navigate to={undefined}>, blanking the whole page.
// Normalizing once here, right where the user object enters the app,
// means every consumer (App.jsx, ProtectedRoute.jsx, Layout.jsx,
// Login.jsx) keeps working without needing its own patch — and stays
// correct even if the backend's exact casing changes again later.
function normalizeUser(user) {
  if (!user) return user;
  return {
    ...user,
    systemRole: (user.systemRole || "").toLowerCase(),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("lt_token");
    if (!token) { setReady(true); return; }
    client.get("/auth/me")
      .then((res) => setUser(normalizeUser(res.data)))
      .catch(() => { localStorage.removeItem("lt_token"); })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await client.post("/auth/login", { email, password });
    localStorage.setItem("lt_token", res.data.accessToken);
    const normalized = normalizeUser(res.data.user);
    setUser(normalized);
    return normalized;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("lt_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
