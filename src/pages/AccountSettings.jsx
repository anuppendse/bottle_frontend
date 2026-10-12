import React, { useEffect, useState } from "react";
import client from "../api/client";

const FIELDS = [
  ["Name", "name"],
  ["Email", "email"],
  ["Username", "username"],
  ["Manufacturer", "manufacturer"],
  ["Role", "role"],
];

export default function AccountSettings() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/auth/account")
      .then((res) => setData(res.data))
      .catch((e) =>
        setError(e.response?.data?.error || "Could not load account details.")
      );
  }, []);

  if (error) return <div className="text-red">{error}</div>;
  if (!data) return <div className="text-faint">Loading…</div>;

  return (
    <div className="bg-white border border-line rounded-xl p-6 max-w-xl mx-auto"  >
      <h2 className="text-lg font-bold text-ink-soft mb-4">Account details</h2>
      <dl className="divide-y divide-line">
        {FIELDS.map(([label, key]) => (
          <div key={key} className="flex justify-between py-3 text-[13.5px]">
            <dt className="text-faint">{label}</dt>
            <dd className={`font-medium text-ink-soft ${key === "role" ? "capitalize" : ""}`}>
              {data[key] || "—"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}