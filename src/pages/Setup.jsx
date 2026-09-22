import React, { useEffect, useState } from "react";
import client from "../api/client";
import PageHead from "../components/PageHead";
import Field from "../components/Field";
import Toast from "../components/Toast";
import useToast from "../components/useToast";

export default function Setup() {
  const [toast, fireToast] = useToast();

  // -------- Create role permission (dropdown + Add) --------
  const [permissionKeys, setPermissionKeys] = useState([]);
  const [selectedPermissionId, setSelectedPermissionId] = useState("");
  const [rpRows, setRpRows] = useState([]);

  useEffect(() => {
    client.get("/permissions/keys").then((res) => {
      setPermissionKeys(res.data);

      if (res.data.length) {
        setSelectedPermissionId(String(res.data[0].id));
      }
    });
  }, []);

  async function handleAdd() {
    if (!selectedPermissionId) return;

    try {
      const res = await client.post("/permissions/role-permissions", {
        id: Number(selectedPermissionId),
      });

      console.log("Role permission API response:", res.data);

      if (Array.isArray(res.data.rp)) {
        setRpRows(res.data.rp);
        setHasSetOnce(false);
        fireToast("Role permission rows ready.");
        fetchTree(); // keep the All role permissions table in sync immediately
        return;
      }

      if (res.data.message) {
        fireToast(res.data.message, "err");
        setRpRows([]);
        return;
      }

      setRpRows([]);

      fireToast("Role permission rows were not returned by the server.", "err");
    } catch (e) {
      console.error("Add role permission error:", e);

      fireToast(
        e.response?.data?.error || e.response?.data?.message || e.message,
        "err",
      );
    }
  }

  const [isSettingPermission, setIsSettingPermission] = useState(false);
  const [hasSetOnce, setHasSetOnce] = useState(false);

  // -------- UPDATE ROLE PERMISSION LOCALLY --------
  function handlePermissionToggle(node, granted) {
    setTree((prevTree) => {
      const updatedTree = { ...prevTree };

      updatedTree[node.role || selectedRole] = (
        updatedTree[node.role || selectedRole] || []
      ).map((permission) => {
        if (permission.id === node.id) {
          return {
            ...permission,
            granted: granted,
          };
        }

        return permission;
      });

      return updatedTree;
    });
  }

  // -------- SAVE ALL ROLE PERMISSIONS --------
  async function handleSavePermissions() {
    if (!selectedRole) return;

    const permissions = tree[selectedRole] || [];

    const role_permission_ids = permissions.map((permission) => permission.id);

    const granted_perms = permissions.map((permission) => !!permission.granted);

    try {
      const res = await client.patch("/permissions/role-permissions", {
        role_permission_ids,
        granted_perms,
      });

      console.log("Permissions updated:", res.data);

      fireToast("Permissions updated successfully.");
    } catch (e) {
      console.error("Permission update error:", e);

      fireToast(
        e.response?.data?.error || e.response?.data?.message || e.message,
        "err",
      );
    }
  }

  // -------- Full role-permission tree (read-only except granted checkbox) --------
  const [tree, setTree] = useState({});
  const [selectedRole, setSelectedRole] = useState("");

  function fetchTree() {
    return client
      .get("/permissions")
      .then((res) => {
        setTree(res.data);
      })
      .catch((e) => {
        console.error("Error fetching permissions:", e);
      });
  }

  useEffect(() => {
    fetchTree(); // initial load only
  }, []);

  function handleRoleChange(e) {
    setSelectedRole(e.target.value);
    fetchTree(); // always refetch, even if the value didn't change
  }

  return (
    <>
      <PageHead
        eyebrow="Admin only"
        title="Roles & Permissions"
        desc="Create role permissions for a chosen permission, then set them into the role permission table."
      />

      {/* Create role permission */}
      <div className="card mb-5">
        <div className="panel-title mb-4.5">Create role permission</div>

        <Field
          label="Permission"
          hint="Pick a permission and click Add to make sure Admin, Manufacturer, and Employee each have a row for it."
        >
          <div className="flex items-center gap-3">
            <select
              className="input max-w-sm"
              value={selectedPermissionId}
              onChange={(e) => setSelectedPermissionId(e.target.value)}
            >
              {permissionKeys.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label || p.key}
                </option>
              ))}
            </select>

            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={!selectedPermissionId}
            >
              Add
            </button>
          </div>
        </Field>

        {rpRows.length > 0 && (
          <>
            <table className="w-full text-sm mt-4">
              <thead>
                <tr className="text-left text-faint">
                  <th className="pb-2">Permission</th>
                  <th className="pb-2">role</th>
                  <th className="pb-2">granted</th>
                </tr>
              </thead>

              <tbody>
                {rpRows.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="py-2">
                      {permissionKeys.find(
                        (p) => Number(p.id) === Number(selectedPermissionId),
                      )?.label || row.key}
                    </td>

                    <td className="py-2">{row.role}</td>

                    <td className="py-2">
                      <input
                        type="checkbox"
                        checked={!!row.granted}
                        disabled
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Full role-permission tree */}
      <div className="card">
        <div className="panel-title mb-4.5">All role permissions</div>

        <Field label="Role">
          <select
            className="input max-w-sm"
            value={selectedRole}
            onChange={handleRoleChange}
          >
            <option value="">Select a role</option>

            {Object.keys(tree).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </Field>

        {selectedRole && (
          <>
            <table className="w-full text-sm mt-4">
              <thead>
                <tr className="text-left text-faint">
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Label</th>
                  <th className="pb-2">Granted</th>
                </tr>
              </thead>

              <tbody>
                {(tree[selectedRole] || []).map((node) => (
                  <tr key={node.id} className="border-t border-line">
                    <td className="py-2">{selectedRole}</td>
                    <td className="py-2">{node.label}</td>

                    <td className="py-2">
                      <input
                        type="checkbox"
                        checked={!!node.granted}
                        onChange={(e) =>
                          handlePermissionToggle(node, e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Save button - visible only when a role is selected */}
            <div className="mt-5 pt-4 border-t border-line flex justify-end">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSavePermissions}
              >
                Save
              </button>
            </div>
          </>
        )}
      </div>

      <Toast toast={toast} />
    </>
  );
}