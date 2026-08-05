/**
 * api.ts
 * Users HTTP API — proxies to Express via Next BFF `/api/users`.
 * Maps backend `{ name, isActive }` ↔ UI `{ firstName, lastName, status }`.
 *
 * listUsers()         GET    /api/users
 * getUser()           GET    /api/users/:id
 * createUser()        POST   /api/users
 * updateUser()        PUT    /api/users/:id
 * updateUserStatus()  PATCH  /api/users/:id/status
 * deleteUser()        DELETE /api/users/:id
 */
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  unwrapData,
} from "@/api/http";
import {
  createModuleApiCall,
  dedupeInflight,
  toPaginatedMeta,
} from "@/lib/api/module-helpers";
import type { PaginatedResponse } from "@/types";
import type { ApiResponse } from "@/types/api";
import type { User, UserStatus } from "@/types/user";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UsersListParams,
} from "./users-types";

export type { CreateUserPayload, UpdateUserPayload, UsersListParams };

const usersCall = createModuleApiCall("users");

/** Raw user shape from Express `/api/v1/users` */
interface BackendUser {
  id?: string;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  roleId?: string | { _id?: string };
  role?: string;
  roleName?: string;
  isActive?: boolean;
  status?: UserStatus;
  avatarUrl?: string;
  permissions?: User["permissions"];
  timezone?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UsersListResponse {
  success: boolean;
  data: BackendUser[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function joinName(firstName?: string, lastName?: string): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function statusToIsActive(status?: UserStatus): boolean {
  return status !== "inactive" && status !== "suspended";
}

function isActiveToStatus(isActive?: boolean, status?: UserStatus): UserStatus {
  if (status) return status;
  return isActive === false ? "inactive" : "active";
}

function roleIdToString(roleId: BackendUser["roleId"]): string {
  if (!roleId) return "";
  if (typeof roleId === "string") return roleId;
  return String(roleId._id ?? "");
}

function mapBackendUser(raw: BackendUser): User {
  const fromParts =
    raw.firstName != null || raw.lastName != null
      ? {
          firstName: raw.firstName ?? "",
          lastName: raw.lastName ?? "",
        }
      : splitName(raw.name ?? "");

  const roleName = raw.roleName || raw.role || "";

  return {
    id: String(raw.id ?? raw._id ?? ""),
    email: raw.email,
    firstName: fromParts.firstName,
    lastName: fromParts.lastName,
    avatarUrl: raw.avatarUrl,
    roleId: roleIdToString(raw.roleId),
    roleName,
    role: roleName,
    permissions: raw.permissions ?? {},
    status: isActiveToStatus(raw.isActive, raw.status),
    timezone: raw.timezone,
    lastLoginAt: raw.lastLoginAt,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

function toBackendCreateBody(payload: CreateUserPayload) {
  return {
    name: joinName(payload.firstName, payload.lastName),
    email: payload.email,
    password: payload.password,
    roleId: payload.roleId,
    isActive: statusToIsActive(payload.status ?? "invited"),
  };
}

function toBackendUpdateBody(payload: UpdateUserPayload) {
  const body: Record<string, unknown> = {};
  if (payload.firstName != null || payload.lastName != null) {
    body.name = joinName(payload.firstName, payload.lastName);
  }
  if (payload.email != null) body.email = payload.email;
  if (payload.password) body.password = payload.password;
  if (payload.roleId != null) body.roleId = payload.roleId;
  if (payload.status != null) body.isActive = statusToIsActive(payload.status);
  return body;
}

/* ========== LIST — GET /api/users ========== */

/** listUsers() → GET /api/users */
export async function listUsers(
  params: UsersListParams = {}
): Promise<PaginatedResponse<User>> {
  const query = {
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    role: params.role && params.role !== "all" ? params.role : undefined,
    status:
      params.status && params.status !== "all" ? params.status : undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  };
  return usersCall("listUsers", "GET", "/api/users", async () => {
    const key = `GET /api/users:${JSON.stringify(query)}`;
    return dedupeInflight(key, async () => {
      const res = await apiGet<UsersListResponse>("/api/users", query);
      return {
        data: (res.data ?? []).map(mapBackendUser),
        meta: toPaginatedMeta(res.pagination, params.limit ?? 10),
      };
    });
  }, query);
}

/* ========== READ — GET /api/users/:id ========== */

/** getUser() → GET /api/users/:id */
export async function getUser(id: string): Promise<User> {
  const url = `/api/users/${id}`;
  return usersCall("getUser", "GET", url, async () => {
    return dedupeInflight(`GET ${url}`, async () => {
      const raw = await unwrapData(apiGet<ApiResponse<BackendUser>>(url));
      return mapBackendUser(raw);
    });
  }, { id });
}

/* ========== CREATE — POST /api/users ========== */

/** createUser() → POST /api/users */
export async function createUser(payload: CreateUserPayload): Promise<User> {
  const body = toBackendCreateBody(payload);
  return usersCall("createUser", "POST", "/api/users", async () => {
    const raw = await unwrapData(
      apiPost<ApiResponse<BackendUser>>("/api/users", body)
    );
    return mapBackendUser(raw);
  }, body);
}

/* ========== UPDATE — PUT /api/users/:id ========== */

/** updateUser() → PUT /api/v1/users/:id (Express uses PUT) */
export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<User> {
  const url = `/api/users/${id}`;
  const body = toBackendUpdateBody(payload);
  return usersCall("updateUser", "PUT", url, async () => {
    const raw = await unwrapData(
      apiPut<ApiResponse<BackendUser>>(url, body)
    );
    return mapBackendUser(raw);
  }, { id, body });
}

/* ========== STATUS — PATCH /api/users/:id/status ========== */

/** updateUserStatus() → PATCH /api/v1/users/:id/status */
export async function updateUserStatus(
  id: string,
  status: UserStatus
): Promise<User> {
  const url = `/api/users/${id}/status`;
  const body = { isActive: statusToIsActive(status) };
  return usersCall("updateUserStatus", "PATCH", url, async () => {
    const raw = await unwrapData(
      apiPatch<ApiResponse<BackendUser>>(url, body)
    );
    return mapBackendUser(raw);
  }, { id, status });
}

/* ========== DELETE — DELETE /api/users/:id ========== */

/** deleteUser() → DELETE /api/users/:id */
export async function deleteUser(id: string): Promise<void> {
  const url = `/api/users/${id}`;
  return usersCall("deleteUser", "DELETE", url, async () => {
    await apiDelete<ApiResponse<null>>(url);
  }, { id });
}

/* ---------- namespace ---------- */
export const usersApi = {
  list: listUsers,
  getById: getUser,
  create: createUser,
  update: updateUser,
  updateStatus: updateUserStatus,
  delete: deleteUser,
};
