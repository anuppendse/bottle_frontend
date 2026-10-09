// ------------------------------------------------------------------
// Central permission rules for the frontend.
//
// Matches the `permissions` table exactly:
//   PARENT rows (parent_id = NULL)  → a TAB / page in the sidebar
//   CHILD rows  (parent_id = <tab>) → an action INSIDE that page
//
// A child is only allowed when BOTH the child and its parent tab are
// granted. Granted flags come from the logged-in user's role
// (role_permissions) with any per-user override (user_permissions)
// applied, fetched at runtime from GET /api/permissions?user_id=<me>.
//
// Keys are matched case-insensitively, so "Product" / "product" both work.
// ------------------------------------------------------------------

// Frontend page name → permissions.key of its TAB (parent) row.
// App.jsx routes and the sidebar use the names on the left.
export const TABS = {
  dashboard: "Dashboard",          // id 1
  products: "Product",             // id 2
  categories: "Categories",        // id 6
  labelGeneration: "Lable_Generation", // id 10
  batches: "Batch_Management",     // id 11
  csvDownloads: "CSV_Downloads",   // id 14
  csvRequests: "Redownload_Request", // id 17
  users: "User",                   // id 20
  manufacturers: "Manufacturer",   // id 24
  setup: "Setup",                  // id 28
};

// Action → permissions.key of the CHILD row that controls it.
// (Where a page has no child row for an action, the tab itself is used.)
export const ACTIONS = {
  // Product (2)
  PRODUCT_ADD: "Add_Product",                 // 3
  PRODUCT_EDIT: "Edit_Product",               // 4
  PRODUCT_STATUS: "Activate_Product",         // 5

  // Categories (6)
  CATEGORY_ADD: "Add_Categories",             // 7
  CATEGORY_EDIT: "Edit_Categories",           // 8
  CATEGORY_STATUS: "Activate_Categories",     // 9

  // Lable Generation (10) — no child rows, the tab grants generating
  LABEL_GENERATE: "Lable_Generation",         // 10

  // Batch Management (11)
  BATCH_VIEW: "Batch_Management",             // 11 (tab) — open batch detail
  BATCH_ACTIVATE: "Activate_Batch",           // 12
  BATCH_RECALL: "Recall_Batch",               // 13

  // CSV Download (14)
  CSV_DOWNLOAD: "Download_CSV",               // 15
  CSV_REQUEST_REDOWNLOAD: "Request_CSV",      // 16

  // Redownload Request (17)
  CSV_REQUEST_APPROVE: "Approve_Request",     // 18
  CSV_REQUEST_REJECT: "Reject_Request",       // 19

  // User (20)
  USER_ADD: "Add_User",                       // 21
  USER_EDIT: "Edit_User",                     // 22
  USER_STATUS: "Activate_User",               // 23
  USER_PERMISSIONS: "Edit_User",              // 22 — per-user permission overrides

  // Manufacturer (24)
  MANUFACTURER_ADD: "Add_Manufacturer",       // 25
  MANUFACTURER_EDIT: "Edit_Manufacturer",     // 26
  MANUFACTURER_DELETE: "Activate_Manufacturer", // 27 — the page's Delete button

  // Setup (28)
  SETUP_CREATE: "Create_Role_Permissions",    // 29
  SETUP_EDIT: "Edit_Role_Permissions",        // 30
};

// Hard ceiling per TAB — mirrors ROLE_ALLOWED in backend/app/decorators.py.
// Even if the DB grants a tab, the backend will 403 a role not listed
// here, so the UI hides it rather than showing a page full of errors.
const ROLE_CEILING = {
  dashboard: ["admin", "manufacturer"],
  product: ["admin", "manufacturer", "employee"],
  categories: ["admin", "manufacturer", "employee"],
  lable_generation: ["admin", "manufacturer"],
  batch_management: ["admin", "manufacturer"],
  csv_downloads: ["admin", "manufacturer", "employee"],
  redownload_request: ["admin"],
  user: ["admin", "manufacturer"],
  manufacturer: ["admin"],
  setup: ["admin"],
};

// Lockout guard: an Admin can always open Setup and edit role
// permissions, so unticking them for ADMIN can't lock everyone out of
// the only screen that can turn them back on.
const ADMIN_ALWAYS = ["setup", "edit_role_permissions"];

// Sidebar / landing order. The first tab a user can open is where they
// land after login.
export const PAGES = [
  { key: "dashboard", to: "/" },
  { key: "products", to: "/products" },
  { key: "categories", to: "/categories" },
  { key: "labelGeneration", to: "/label-generation" },
  { key: "batches", to: "/batches" },
  { key: "csvDownloads", to: "/csv-downloads" },
  { key: "csvRequests", to: "/csv-requests" },
  { key: "users", to: "/users" },
  { key: "manufacturers", to: "/manufacturers" },
  { key: "setup", to: "/setup" },
];

const norm = (k) => String(k || "").trim().toLowerCase();

const warned = new Set();
function warnMissing(key) {
  if (!import.meta.env?.DEV || warned.has(key)) return;
  warned.add(key);
  // eslint-disable-next-line no-console
  console.warn(`[permissions] "${key}" is not in this role's permission rows — treated as NOT granted.`);
}

/**
 * Builds a permission checker for one user.
 *
 * @param {object} user   normalized user (systemRole lowercase)
 * @param {Array}  nodes  rows from GET /permissions?user_id=… →
 *                        [{ key, permission_id, parent_id, granted, … }]
 */
export function buildChecker(user, nodes) {
  const role = user?.systemRole || "";
  const byKey = new Map();
  const byId = new Map();
  for (const n of nodes || []) {
    byKey.set(norm(n.key), n);
    byId.set(Number(n.permission_id), n);
  }

  function tabOf(node) {
    let cur = node;
    let depth = 0;
    while (cur && cur.parent_id != null && depth < 10) {
      const p = byId.get(Number(cur.parent_id));
      if (!p) break;
      cur = p;
      depth += 1;
    }
    return cur;
  }

  // Granted AND every ancestor (tab) granted.
  function grantedChain(node, depth = 0) {
    if (!node || depth > 10) return false;
    if (role === "admin" && ADMIN_ALWAYS.includes(norm(node.key))) return true;
    if (!node.granted) return false;
    if (node.parent_id == null) return true;
    const parent = byId.get(Number(node.parent_id));
    return parent ? grantedChain(parent, depth + 1) : false;
  }

  function canKey(name) {
    if (!user || !name) return false;
    const key = norm(TABS[name] || name);

    // Lockout guard for Admin even if the row is missing entirely.
    if (role === "admin" && ADMIN_ALWAYS.includes(key)) return true;

    const node = byKey.get(key);
    if (!node) {
      warnMissing(TABS[name] || name);
      return false;
    }

    const tab = tabOf(node);
    const allowedRoles = ROLE_CEILING[norm(tab?.key)];
    if (allowedRoles && !allowedRoles.includes(role)) return false;

    return grantedChain(node);
  }

  // can("products") · can(ACTIONS.PRODUCT_ADD) · can([a, b]) = any of
  function can(keyOrList) {
    if (!user) return false;
    if (Array.isArray(keyOrList)) return keyOrList.some(canKey);
    return canKey(keyOrList);
  }

  function landing() {
    const first = PAGES.find((p) => canKey(p.key));
    return first ? first.to : null;
  }

  return { can, landing };
}
