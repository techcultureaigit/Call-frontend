import type { ApiResponse, PaginatedResponse } from "@/types";
import type { User, UserRole, UserStatus } from "@/types/user";
import { createQueryString } from "@/lib/utils";

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ?? "Request failed"
    );
  }
  return response.json() as Promise<T>;
}

export const usersModuleService = {
  async list(params: UsersListParams = {}) {
    const query = createQueryString(
      params as Record<string, string | number | boolean | undefined>
    );
    const response = await fetch(`/api/users${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return handleResponse<PaginatedResponse<User>>(response);
  },

  async getById(id: string) {
    const response = await fetch(`/api/users/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<ApiResponse<User>>(response);
    return json.data;
  },

  async create(payload: CreateUserPayload) {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await handleResponse<ApiResponse<User>>(response);
    return json.data;
  },

  async update(id: string, payload: UpdateUserPayload) {
    const response = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await handleResponse<ApiResponse<User>>(response);
    return json.data;
  },

  async delete(id: string) {
    const response = await fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    return handleResponse<ApiResponse<null>>(response);
  },

  async toggleStatus(id: string, status: UserStatus) {
    return this.update(id, { status });
  },
};
