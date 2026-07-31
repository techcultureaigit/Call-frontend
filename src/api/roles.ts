import type { ApiResponse } from "@/types/api";
import type { Role, RoleListItem, RolePermissions } from "@/types/role";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: RolePermissions;
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

/** Backend Express roles API — dynamic Role model */
export const rolesApi = {
  list: (search = "") =>
    apiGet<ApiResponse<RoleListItem[]>>("/roles", {
      params: { search: search || undefined, limit: 100 },
    }),

  getById: (id: string) =>
    apiGet<ApiResponse<Role>>(`/roles/${id}`),

  getPermissionModules: () =>
    apiGet<
      ApiResponse<{ modules: string[]; actions: string[]; matrix: unknown }>
    >("/roles/permissions/modules"),

  create: (payload: CreateRolePayload) =>
    apiPost<ApiResponse<Role>>("/roles", payload),

  update: (id: string, payload: UpdateRolePayload) =>
    apiPut<ApiResponse<Role>>(`/roles/${id}`, payload),

  delete: (id: string) => apiDelete<ApiResponse<null>>(`/roles/${id}`),
};
