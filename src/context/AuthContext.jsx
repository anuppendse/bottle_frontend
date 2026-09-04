import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("lt_token");
    if (!token) { setReady(true); return; }
    client.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => { localStorage.removeItem("lt_token"); })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await client.post("/auth/login", { email, password });
    localStorage.setItem("lt_token", res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
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
