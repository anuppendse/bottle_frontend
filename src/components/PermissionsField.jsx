import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import client from "../api/client";
import Field from "./Field";

export default function PermissionsField({ selected, onChange }) {
  const [tree, setTree] = useState([]);
  const [locked, setLocked] = useState([]);

  useEffect(() => {
    client.get("/permissions").then((res) => {
      setTree(res.data.tree);
      setLocked(res.data.locked);
    });
  }, []);

  function toggleParent(node) {
    if (selected.includes(node.key)) {
      const childKeys = (node.children || []).map((c) => c.key);
      onChange(selected.filter((k) => k !== node.key && !childKeys.includes(k)));
    } else {
      onChange([...selected, node.key]);
    }
  }
  function toggleChild(key) {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  }

  return (
    <Field label="Access permissions" hint="Controls which pages appear in this user's sidebar. Sub-options need their page checked first.">
      <div className="border border-line rounded-md bg-[#FAFAF8] px-3.5">
        {tree.map((node) => {
          const parentChecked = selected.includes(node.key);
          return (
            <div className="py-2.5 border-b border-line last:border-none" key={node.key}>
              <label className="flex items-center gap-2.5 text-[13px] text-text font-medium cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 accent-accent" checked={parentChecked} onChange={() => toggleParent(node)} />
                <span>{node.label}</span>
              </label>
              {node.children && (
                <div className="ml-[23px] mt-1.5 mb-0.5 flex flex-col gap-1.5">
                  {node.children.map((child) => (
                    <label key={child.key} className={`flex items-center gap-2.5 text-[12.5px] text-muted font-medium cursor-pointer ${!parentChecked ? "opacity-45 cursor-not-allowed" : ""}`}>
                      <input type="checkbox" className="w-3.5 h-3.5 accent-accent" checked={selected.includes(child.key)} disabled={!parentChecked}
                        onChange={() => toggleChild(child.key)} />
                      <span>{child.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {locked.map((p) => (
          <div key={p.key} className="flex items-center gap-2.5 text-[13px] text-faint py-2.5">
            <ShieldCheck size={14} /> {p.label} — Admin only, not assignable here
          </div>
        ))}
      </div>
    </Field>
  );
}
