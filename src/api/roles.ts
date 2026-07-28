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

/** Raw HTTP only — services unwrap `data` */
export const rolesApi = {
  list: (search = "") =>
    apiGet<ApiResponse<RoleListItem[]>>(apiEndpoints.roles.list, {
      search: search || undefined,
    }),

  getById: (id: string) =>
    apiGet<ApiResponse<Role>>(apiEndpoints.roles.detail(id)),

  create: (payload: CreateRolePayload) =>
    apiPost<ApiResponse<Role>>(apiEndpoints.roles.list, payload),

  update: (id: string, payload: UpdateRolePayload) =>
    apiPatch<ApiResponse<Role>>(apiEndpoints.roles.detail(id), payload),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(apiEndpoints.roles.detail(id)),
};
