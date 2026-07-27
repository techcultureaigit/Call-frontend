import type { ApiResponse } from "@/types/api";
import type { Role, RoleListItem, RolePermissions } from "@/types/role";
import { apiEndpoints } from "./endpoints";
import { apiDelete, apiGet, apiPatch, apiPost } from "./http";

export interface CreateRolePayload {
  name: string;
  description: string;
  color?: string;
  permissions: RolePermissions;
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

export const rolesApi = {
  list: async (search = "") => {
    const json = await apiGet<ApiResponse<RoleListItem[]>>(
      apiEndpoints.roles.list,
      { search: search || undefined }
    );
    return json.data;
  },

  getById: async (id: string) => {
    const json = await apiGet<ApiResponse<Role>>(apiEndpoints.roles.detail(id));
    return json.data;
  },

  create: async (payload: CreateRolePayload) => {
    const json = await apiPost<ApiResponse<Role>>(
      apiEndpoints.roles.list,
      payload
    );
    return json.data;
  },

  update: async (id: string, payload: UpdateRolePayload) => {
    const json = await apiPatch<ApiResponse<Role>>(
      apiEndpoints.roles.detail(id),
      payload
    );
    return json.data;
  },

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(apiEndpoints.roles.detail(id)),
};
