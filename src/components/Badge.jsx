import React from "react";

const MAP = {
  ACTIVE: ["bg-green-tint text-green", "bg-green", "Active"],
  EXPIRED: ["bg-red-tint text-red", "bg-red", "Expired"],
  RECALLED: ["bg-red-tint text-red", "bg-red", "Recalled"],
  "EXPIRING SOON": ["bg-amber-tint text-amber", "bg-amber", "Expiring soon"],
  "IN PRODUCTION": ["bg-grey-tint text-grey", "bg-grey", "In Production"],
  Pending: ["bg-amber-tint text-amber", "bg-amber", "Pending"],
  Approved: ["bg-green-tint text-green", "bg-green", "Approved"],
  Rejected: ["bg-red-tint text-red", "bg-red", "Rejected"],
  Active: ["bg-green-tint text-green", "bg-green", "Active"],
  Inactive: ["bg-red-tint text-red", "bg-red", "Inactive"],
};

export default function Badge({ status }) {
  const [cls, dotCls, text] = MAP[status] || ["bg-grey-tint text-grey", "bg-grey", status];
  return (
    <span className={`badge ${cls}`}>
      <span className={`dot ${dotCls}`} /> {text}
    </span>
  );
}
