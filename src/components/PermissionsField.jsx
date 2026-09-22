import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import client from "../api/client";
import Field from "./Field";

export default function PermissionsField({
  selected = [],
  onChange,
  role = "EMPLOYEE",
}) {
  const [tree, setTree] = useState([]);
  const [locked, setLocked] = useState([]);

  useEffect(() => {
    loadPermissions();
  }, [role]);

  async function loadPermissions() {
    try {
      const res = await client.get("/permissions");

      console.log("Permissions API response:", res.data);

      /*
       * Backend returns:
       *
       * {
       *   ADMIN: [...],
       *   MANUFACTURER: [...],
       *   EMPLOYEE: [...]
       * }
       */

      const rolePermissions = res.data?.[role] || [];

      /*
       * Separate parents and children
       */
      const parents = rolePermissions.filter(
        (permission) => permission.parent_id === null
      );

      const children = rolePermissions.filter(
        (permission) => permission.parent_id !== null
      );

      /*
       * Build parent -> children structure
       */
      const permissionTree = parents.map((parent) => ({
        ...parent,
        children: children.filter(
          (child) => child.parent_id === parent.permission_id
        ),
      }));

      setTree(permissionTree);

      /*
       * Your current backend does not return "locked",
       * so keep it empty.
       */
      setLocked([]);

    } catch (error) {
      console.error("Error loading permissions:", error);

      setTree([]);
      setLocked([]);
    }
  }

  function toggleParent(node) {
    const childKeys = (node.children || []).map(
      (child) => child.key
    );

    if (selected.includes(node.key)) {
      /*
       * Uncheck parent and all its children
       */
      onChange(
        selected.filter(
          (key) =>
            key !== node.key &&
            !childKeys.includes(key)
        )
      );
    } else {
      /*
       * Check parent
       */
      onChange([
        ...selected,
        node.key
      ]);
    }
  }

  function toggleChild(key) {
    if (selected.includes(key)) {
      onChange(
        selected.filter(
          (item) => item !== key
        )
      );
    } else {
      onChange([
        ...selected,
        key
      ]);
    }
  }

  return (
    <Field
      label="Access permissions"
      hint="Controls which pages appear in this user's sidebar. Sub-options need their page checked first."
    >
      <div className="border border-line rounded-md bg-[#FAFAF8] px-3.5">

        {tree.length === 0 ? (
          <div className="py-4 text-[13px] text-muted">
            No permissions available.
          </div>
        ) : (
          tree.map((node) => {

            const parentChecked =
              selected.includes(node.key);

            return (
              <div
                className="py-2.5 border-b border-line last:border-none"
                key={node.key}
              >

                {/* Parent permission */}
                <label className="flex items-center gap-2.5 text-[13px] text-text font-medium cursor-pointer">

                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 accent-accent"
                    checked={parentChecked}
                    onChange={() =>
                      toggleParent(node)
                    }
                  />

                  <span>
                    {node.label}
                  </span>

                </label>


                {/* Child permissions */}
                {node.children &&
                  node.children.length > 0 && (
                    <div className="ml-[23px] mt-1.5 mb-0.5 flex flex-col gap-1.5">

                      {node.children.map((child) => (

                        <label
                          key={child.key}
                          className={`flex items-center gap-2.5 text-[12.5px] text-muted font-medium cursor-pointer ${
                            !parentChecked
                              ? "opacity-45 cursor-not-allowed"
                              : ""
                          }`}
                        >

                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 accent-accent"
                            checked={selected.includes(
                              child.key
                            )}
                            disabled={!parentChecked}
                            onChange={() =>
                              toggleChild(child.key)
                            }
                          />

                          <span>
                            {child.label}
                          </span>

                        </label>

                      ))}

                    </div>
                  )}

              </div>
            );
          })
        )}

        {/* Locked permissions */}
        {locked.map((permission) => (
          <div
            id={permission.id}
            key={permission.id}
            className="flex items-center gap-2.5 text-[13px] text-faint py-2.5"
          >
            <ShieldCheck size={14} />

            {permission.label} — Admin only, not assignable here
          </div>
        ))}

      </div>
    </Field>
  );
}