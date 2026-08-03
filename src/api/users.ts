import type { ApiResponse } from "@/types/api";
import type { UserStatus } from "@/types/user";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";

/** Raw user shape from Express `/api/v1/users` */
export interface BackendUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role?: string;
  roleName?: string;
  roleId: string;
  isActive: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  /** role id or "all" */
  role?: string;
  status?: UserStatus | "all";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BackendCreateUserPayload {
  name: string;
  email: string;
  password: string;
  roleId: string;
  isActive?: boolean;
}

export interface BackendUpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UsersApiListResponse extends ApiResponse<BackendUser[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Frontend create/update payloads (form shape) */
export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
  status?: UserStatus;
}

export type UpdateUserPayload = Partial<
  Omit<CreateUserPayload, "password"> & { password?: string }
>;

/** Backend Express users API */
export const usersApi = {
  list: (params: UsersListParams = {}) =>
    apiGet<UsersApiListResponse>("/users", {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
        role:
          params.role && params.role !== "all" ? params.role : undefined,
        status:
          params.status && params.status !== "all"
            ? params.status
            : undefined,
      },
    }),

  getById: (id: string) =>
    apiGet<ApiResponse<BackendUser>>(`/users/${id}`),

  create: (payload: BackendCreateUserPayload) =>
    apiPost<ApiResponse<BackendUser>>("/users", payload),

  update: (id: string, payload: BackendUpdateUserPayload) =>
    apiPut<ApiResponse<BackendUser>>(`/users/${id}`, payload),

  updateStatus: (id: string, isActive: boolean) =>
    apiPatch<ApiResponse<BackendUser>>(`/users/${id}/status`, { isActive }),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(`/users/${id}`),
};
