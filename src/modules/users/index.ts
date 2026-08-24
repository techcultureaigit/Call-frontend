/**
 * index.ts
 * users module public exports.
 *
 * ── API (api.ts) ──────────────────────────────────────────────
 *   listUsers()         GET    /api/users
 *   getUser()           GET    /api/users/:id
 *   createUser()        POST   /api/users
 *   updateUser()        PATCH  /api/users/:id
 *   updateUserStatus()  PATCH  /api/users/:id
 *   deleteUser()        DELETE /api/users/:id
 *
 * ── Files ─────────────────────────────────────────────────────
 *   api.ts              — all HTTP API functions (BFF /api/users)
 *   users-list.tsx      — list page → listUsers, delete, toggle status
 *   users-by-id.tsx     — load by id → getUser
 *   users-form.tsx      — create/edit → createUser, updateUser
 *   users-form-fields.tsx — form fields (no direct API)
 *   users-types.ts      — types (no API)
 *   use-users.ts        — React Query hooks → api.ts
 */

export * from "./api";
export { usersApi as api } from "./api";
export type * from "./users-types";
export * from "./users-dialogs";
export * from "./role-badge";
export * from "./status-badge";
export * from "./users-form";
export * from "./users-form-fields";
export * from "./users-by-id";
export * from "./users-pagination";
export * from "./users-table";
export * from "./users-toolbar";
export * from "./users-list";
export * from "./use-users";
