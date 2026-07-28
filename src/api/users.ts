import type { ApiResponse, PaginatedResponse } from "@/types";
import type { User, UserRole, UserStatus } from "@/types/user";
import { apiEndpoints } from "./endpoints";
import { apiDelete, apiGet, apiPatch, apiPost } from "./http";

export interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | "all";
  status?: UserStatus | "all";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status?: UserStatus;
  timezone?: string;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

/** Raw HTTP only — services unwrap `data` */
export const usersApi = {
  list: (params: UsersListParams = {}) =>
    apiGet<PaginatedResponse<User>>(apiEndpoints.users.list, params),

  getById: (id: string) =>
    apiGet<ApiResponse<User>>(apiEndpoints.users.detail(id)),

  create: (payload: CreateUserPayload) =>
    apiPost<ApiResponse<User>>(apiEndpoints.users.list, payload),

  update: (id: string, payload: UpdateUserPayload) =>
    apiPatch<ApiResponse<User>>(apiEndpoints.users.detail(id), payload),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(apiEndpoints.users.detail(id)),
};
