import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import client from "../api/client";
import { buildChecker } from "../permissions/permissions";

const AuthContext = createContext(null);

// The backend's Role enum values are uppercase ("ADMIN", "MANUFACTURER",
// "EMPLOYEE"). Every frontend check compares `systemRole` against
// lowercase strings, so normalize once here where the user object
// enters the app.
function normalizeUser(user) {
  if (!user) return user;
  return {
    ...user,
    systemRole: (user.systemRole || user.role || "").toLowerCase(),
  };
}

// The user's effective permissions for THEIR role, with any per-user
// override applied. We use this instead of `user.permissions` from
// /auth/me, which is a list of numeric IDs and can include rows that
// belong to other roles.
async function fetchPermissionNodes(user) {
  try {
    const res = await client.get("/permissions", { params: { user_id: user.id } });
    const rows = res.data?.user_permissions;
    if (Array.isArray(rows) && rows.length) return rows;
  } catch (e) {
    console.warn("Per-user permissions unavailable, using role defaults:", e.message);
  }
  // Fallback: the role's defaults from the full role → permissions map.
  const res = await client.get("/permissions");
  const roleKey = Object.keys(res.data || {}).find(
    (r) => r.toLowerCase() === (user.systemRole || "").toLowerCase(),
  );
  return roleKey ? res.data[roleKey] : [];
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permNodes, setPermNodes] = useState([]);
  const [ready, setReady] = useState(false);

  const loadPermissions = useCallback(async (u) => {
    if (!u?.id) { setPermNodes([]); return; }
    try {
      const rows = await fetchPermissionNodes(u);
      if (import.meta.env.DEV) {
        console.table(rows.map((r) => ({ id: r.permission_id, key: r.key, parent: r.parent_id, granted: r.granted })));
      }
      setPermNodes(rows);
    } catch (e) {
      // Fail closed: no permissions → only Admin-only Setup stays reachable for admins.
      console.error("Could not load permissions:", e);
      setPermNodes([]);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("lt_token");
    if (!token) { setReady(true); return; }
    client.get("/auth/me")
      .then(async (res) => {
        const u = normalizeUser(res.data);
        await loadPermissions(u);
        setUser(u);
      })
      .catch(() => { localStorage.removeItem("lt_token"); })
      .finally(() => setReady(true));
  }, [loadPermissions]);

  const login = useCallback(async (email, password) => {
    const res = await client.post("/auth/login", { email, password });
    localStorage.setItem("lt_token", res.data.accessToken);
    const normalized = normalizeUser(res.data.user);
    await loadPermissions(normalized);
    setUser(normalized);
    return normalized;
  }, [loadPermissions]);

  const logout = useCallback(() => {
    localStorage.removeItem("lt_token");
    setUser(null);
    setPermNodes([]);
  }, []);

  // Call after changing role/user permissions (e.g. from Setup) so the
  // current session picks the change up without a re-login.
  const refreshPermissions = useCallback(() => loadPermissions(user), [loadPermissions, user]);

  const checker = useMemo(() => buildChecker(user, permNodes), [user, permNodes]);

  const value = {
    user,
    setUser,
    login,
    logout,
    ready,
    permNodes,
    refreshPermissions,
    can: checker.can,
    landing: checker.landing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

// Convenience hook: const can = useCan(); can(ACTIONS.PRODUCT_ADD)
export function useCan() {
  return useContext(AuthContext).can;
}
