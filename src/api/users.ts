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

export const usersApi = {
  list: (params: UsersListParams = {}) =>
    apiGet<PaginatedResponse<User>>(apiEndpoints.users.list, params),

  getById: async (id: string) => {
    const json = await apiGet<ApiResponse<User>>(
      apiEndpoints.users.detail(id)
    );
    return json.data;
  },

  create: async (payload: CreateUserPayload) => {
    const json = await apiPost<ApiResponse<User>>(
      apiEndpoints.users.list,
      payload
    );
    return json.data;
  },

  update: async (id: string, payload: UpdateUserPayload) => {
    const json = await apiPatch<ApiResponse<User>>(
      apiEndpoints.users.detail(id),
      payload
    );
    return json.data;
  },

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(apiEndpoints.users.detail(id)),

  toggleStatus: (id: string, status: UserStatus) =>
    usersApi.update(id, { status }),
};
