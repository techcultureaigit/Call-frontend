/**
 * index.ts
 * roles module public exports.
 *
 * ── API (api.ts) ──────────────────────────────────────────────
 *   listRoles()              GET    /api/roles
 *   getRole()                GET    /api/roles/:id
 *   getRolePermissionModules() — static matrix (no BFF route)
 *   createRole()             POST   /api/roles
 *   updateRole()             PATCH  /api/roles/:id
 *   deleteRole()             DELETE /api/roles/:id
 *
 * ── Files ─────────────────────────────────────────────────────
 *   api.ts              — all HTTP API functions
 *   roles-types.ts      — types (no API)
 *   roles-mapper.ts     — backend mapping (used by api.ts)
 *   roles-list.tsx      — list page → listRoles, delete
 *   roles-by-id.tsx     — load by id → getRole
 *   roles-form.tsx      — create/edit → createRole, updateRole
 *   roles-form-fields.tsx — form fields (no direct API)
 *   roles-dialogs.tsx   — delete dialog (no direct API)
 *   use-roles.ts        — React Query hooks → api.ts
 */

export { rolesApi } from "./api";
export type { CreateRolePayload, UpdateRolePayload } from "./api";
export type * from "./roles-types";
export {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissionModules,
} from "./api";
export * from "./roles-dialogs";
export * from "./permission-matrix";
export * from "./roles-form";
export * from "./roles-form-fields";
export * from "./roles-by-id";
export * from "./roles-table";
export * from "./roles-toolbar";
export * from "./roles-list";
export * from "./use-roles";
