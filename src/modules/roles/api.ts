/**
 * api.ts
 * Roles HTTP API — all backend calls live here.
 * Debug: [roles-api] in DevTools console.
 *
 * listRoles()                GET    /api/roles
 * getRole()                  GET    /api/roles/:id
 * getRolePermissionModules() — static matrix (no BFF route)
 * createRole()               POST   /api/roles
 * updateRole()               PATCH  /api/roles/:id
 * deleteRole()               DELETE /api/roles/:id
 */
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  unwrapData,
} from "@/api/http";
import { createModuleApiCall, dedupeInflight } from "@/lib/api/module-helpers";
import type { ApiResponse } from "@/types/api";
import type { Role, RoleListItem } from "@/types/role";
import {
  DEFAULT_PERMISSION_MODULES,
  sanitizeRolePermissions,
} from "./roles-mapper";
import type { CreateRolePayload, UpdateRolePayload } from "./roles-types";

export type { CreateRolePayload, UpdateRolePayload };

const rolesCall = createModuleApiCall("roles");

/* ========== LIST — GET /api/roles ========== */

/** listRoles() → GET /api/roles */
export async function listRoles(search = ""): Promise<RoleListItem[]> {
  const query = { search: search || undefined };
  return rolesCall("listRoles", "GET", "/api/roles", async () => {
    return dedupeInflight(`GET /api/roles:${search || ""}`, async () => {
      return await unwrapData(
        apiGet<ApiResponse<RoleListItem[]>>("/api/roles", query)
      );
    });
  }, query);
}

/* ========== READ — GET /api/roles/:id ========== */

/** getRole() → GET /api/roles/:id */
export async function getRole(id: string): Promise<Role> {
  const url = `/api/roles/${id}`;
  return rolesCall("getRole", "GET", url, async () => {
    return dedupeInflight(`GET ${url}`, async () => {
      return await unwrapData(apiGet<ApiResponse<Role>>(url));
    });
  }, { id });
}

/** getRolePermissionModules() — static frontend matrix */
export async function getRolePermissionModules() {
  return DEFAULT_PERMISSION_MODULES;
}

/* ========== CREATE — POST /api/roles ========== */

/** createRole() → POST /api/roles */
export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const body = {
    name: payload.name,
    description: payload.description ?? "",
    permissions: sanitizeRolePermissions(payload.permissions),
  };
  return rolesCall("createRole", "POST", "/api/roles", async () => {
    return await unwrapData(apiPost<ApiResponse<Role>>("/api/roles", body));
  }, body);
}

/* ========== UPDATE — PUT /api/roles/:id ========== */

/** updateRole() → PUT /api/v1/roles/:id (Express uses PUT) */
export async function updateRole(
  id: string,
  payload: UpdateRolePayload
): Promise<Role> {
  const url = `/api/roles/${id}`;
  const body: UpdateRolePayload = { ...payload };
  if (payload.permissions) {
    body.permissions = sanitizeRolePermissions(payload.permissions);
  }
  return rolesCall("updateRole", "PUT", url, async () => {
    return await unwrapData(apiPut<ApiResponse<Role>>(url, body));
  }, { id, body });
}

/* ========== DELETE — DELETE /api/roles/:id ========== */

/** deleteRole() → DELETE /api/roles/:id */
export async function deleteRole(id: string): Promise<void> {
  const url = `/api/roles/${id}`;
  return rolesCall("deleteRole", "DELETE", url, async () => {
    await apiDelete<ApiResponse<null>>(url);
  }, { id });
}

/* ---------- namespace ---------- */
export const rolesApi = {
  list: listRoles,
  getById: getRole,
  getPermissionModules: getRolePermissionModules,
  create: createRole,
  update: updateRole,
  delete: deleteRole,
};
