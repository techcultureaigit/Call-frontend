import type { ApiResponse } from "@/types/api";
import type { Role, RoleListItem, RolePermissions } from "@/types/role";
import { createQueryString } from "@/lib/utils";

export interface CreateRolePayload {
  name: string;
  description: string;
  color?: string;
  permissions: RolePermissions;
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ?? "Request failed"
    );
  }
  return response.json() as Promise<T>;
}

export const rolesModuleService = {
  async list(search = "") {
    const query = createQueryString({ search: search || undefined });
    const response = await fetch(`/api/roles${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<ApiResponse<RoleListItem[]>>(response);
    return json.data;
  },

  async getById(id: string) {
    const response = await fetch(`/api/roles/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<ApiResponse<Role>>(response);
    return json.data;
  },

  async create(payload: CreateRolePayload) {
    const response = await fetch("/api/roles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await handleResponse<ApiResponse<Role>>(response);
    return json.data;
  },

  async update(id: string, payload: UpdateRolePayload) {
    const response = await fetch(`/api/roles/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await handleResponse<ApiResponse<Role>>(response);
    return json.data;
  },

  async delete(id: string) {
    const response = await fetch(`/api/roles/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        (error as { message?: string }).message ?? "Failed to delete role"
      );
    }
    return handleResponse<ApiResponse<null>>(response);
  },
};
