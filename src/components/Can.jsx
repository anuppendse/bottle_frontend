import { useAuth } from "../context/AuthContext";

// Renders children only when the current user has the permission.
//   <Can perm={ACTIONS.PRODUCT_ADD}><button>Add</button></Can>
//   <Can perm="batches">…</Can>
export default function Can({ perm, children, fallback = null }) {
  const { can } = useAuth();
  return can(perm) ? children : fallback;
}
