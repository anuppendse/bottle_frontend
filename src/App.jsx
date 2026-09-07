import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Verify from "./pages/Verify";
import AccessDenied from "./pages/AccessDenied";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import DetailPage from "./pages/DetailPage";
import LabelGeneration from "./pages/LabelGeneration";
import DispatchConsole from "./pages/DispatchConsole";
import Batches from "./pages/Batches";
import Recalls from "./pages/Recalls";
import CsvDownloads from "./pages/CsvDownloads";
import CsvRequests from "./pages/CsvRequests";
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import Setup from "./pages/Setup";
import Manufacturers from "./pages/Manufacturers";

function Shell({ resourceKey, children }) {
  return (
    <ProtectedRoute resourceKey={resourceKey}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function RootRedirect() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  const landing = { admin: "/", manufacturer: "/", employee: "/products" };
  if (user.systemRole !== "admin" && user.systemRole !== "manufacturer" && landing[user.systemRole] !== "/") {
    return <Navigate to={landing[user.systemRole]} replace />;
  }
  return (
    <Shell resourceKey="dashboard">
      <Dashboard />
    </Shell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/verify/:token" element={<Verify />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          <Route path="/" element={<RootRedirect />} />
          <Route path="/products" element={<Shell resourceKey="products"><Products /></Shell>} />
          <Route path="/products/:id" element={<Shell resourceKey="products"><DetailPage /></Shell>} />
          <Route path="/label-generation" element={<Shell resourceKey="labelGeneration"><LabelGeneration /></Shell>} />
          <Route path="/dispatch-console" element={<Shell resourceKey="dispatchConsole"><DispatchConsole /></Shell>} />
          <Route path="/batches" element={<Shell resourceKey="batches"><Batches /></Shell>} />
          <Route path="/batches/:id" element={<Shell resourceKey="batches"><DetailPage /></Shell>} />
          <Route path="/recalls" element={<Shell resourceKey="recalls"><Recalls /></Shell>} />
          <Route path="/csv-downloads" element={<Shell resourceKey="csvDownloads"><CsvDownloads /></Shell>} />
          <Route path="/csv-requests" element={<Shell resourceKey="csvRequests"><CsvRequests /></Shell>} />
          <Route path="/users" element={<Shell resourceKey="users"><Users /></Shell>} />
          <Route path="/users/new" element={<Shell resourceKey="users"><AddUser /></Shell>} />
          <Route path="/users/:id/edit" element={<Shell resourceKey="users"><AddUser /></Shell>} />
          <Route path="/setup" element={<Shell resourceKey="setup"><Setup /></Shell>} />
          <Route path="/manufacturers" element={<Shell resourceKey="manufacturers"><Manufacturers /></Shell>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
