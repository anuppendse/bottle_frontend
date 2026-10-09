import React from "react";
import { ShieldCheck } from "lucide-react";
import Field from "./Field";
import { useAuth } from "../context/AuthContext";

/**
 * Per-user permission overrides.
 *
 * `nodes` are the rows from GET /permissions?user_id=<target> — the
 * target's role permissions with their own overrides applied:
 *   { id, key, label, parent_id, permission_id, granted, user_id? }
 * Rows that carry `user_id` are real user_permissions rows (their `id`
 * is the user_permission id and can be PATCHed). Rows without it fall
 * back to the role default and can only be changed in Setup.
 *
 * A non-Admin editor (Manufacturer) can only grant pages they hold
 * themselves — everything else is shown read-only.
 */
export default function PermissionsField({ nodes = [], onChange }) {
  const { user: acting, can } = useAuth();
  const isAdminEditor = acting?.systemRole === "admin";

  // Setup and its children are Admin-only and never assigned per user.
  const isSetup = (n) => String(n.key).toLowerCase() === "setup";
  const parents = nodes.filter((n) => n.parent_id == null && !isSetup(n));
  const childrenOf = (p) => nodes.filter((n) => Number(n.parent_id) === Number(p.permission_id));

  function editable(node) {
    if (!node.user_id) return false; // no override row → role default only
    return isAdminEditor || can(node.key);
  }

  function setGranted(targets, granted) {
    const ids = new Set(targets.map((t) => t.id));
    onChange(nodes.map((n) => (ids.has(n.id) && n.user_id ? { ...n, granted } : n)));
  }

  function toggleParent(node) {
    if (node.granted) {
      // Unchecking a page also revokes its sub-options.
      setGranted([node, ...childrenOf(node)], false);
    } else {
      setGranted([node], true);
    }
  }

  return (
    <Field
      label="Access permissions"
      hint="Overrides this user's role defaults. Controls which pages appear in their sidebar and which actions they can take. Sub-options need their page checked first."
    >
      <div className="border border-line rounded-md bg-[#FAFAF8] px-3.5">
        {parents.length === 0 ? (
          <div className="py-4 text-[13px] text-muted">No permissions available for this role.</div>
        ) : (
          parents.map((node) => {
            const kids = childrenOf(node);
            const parentEditable = editable(node);
            return (
              <div className="py-2.5 border-b border-line last:border-none" key={node.id}>
                <label
                  className={`flex items-center gap-2.5 text-[13px] text-text font-medium ${
                    parentEditable ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 accent-accent"
                    checked={!!node.granted}
                    disabled={!parentEditable}
                    onChange={() => toggleParent(node)}
                  />
                  <span>{node.label || node.key}</span>
                  {!node.user_id && <span className="text-[11px] text-faint">(role default)</span>}
                </label>

                {kids.length > 0 && (
                  <div className="ml-[23px] mt-1.5 mb-0.5 flex flex-col gap-1.5">
                    {kids.map((child) => {
                      const childEditable = editable(child) && !!node.granted;
                      return (
                        <label
                          key={child.id}
                          className={`flex items-center gap-2.5 text-[12.5px] text-muted font-medium ${
                            childEditable ? "cursor-pointer" : "opacity-45 cursor-not-allowed"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 accent-accent"
                            checked={!!child.granted && !!node.granted}
                            disabled={!childEditable}
                            onChange={() => setGranted([child], !child.granted)}
                          />
                          <span>{child.label || child.key}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}

        <div className="flex items-center gap-2.5 text-[13px] text-faint py-2.5 border-t border-line">
          <ShieldCheck size={14} /> Setup — Admin only, not assignable here
        </div>
      </div>
    </Field>
  );
}
