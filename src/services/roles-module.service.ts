import { rolesApi } from "@/api/roles";
import {
  ALL_PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  PERMISSION_MODULE_GROUPS,
} from "@/config/permission-modules";
import { ApiClientError } from "@/lib/api";
import type { Role, RoleListItem, RolePermissions } from "@/types/role";

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: RolePermissions;
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

function unwrapError(error: unknown, fallback: string): Error {
  if (error instanceof ApiClientError) {
    return new Error(error.message || fallback);
  }
  if (error instanceof Error) return error;
  return new Error(fallback);
}

/** Roles service — Express `/api/v1/roles` via axios `rolesApi` */
export const rolesModuleService = {
  list: async (search = ""): Promise<RoleListItem[]> => {
    try {
      const res = await rolesApi.list(search);
      return res.data ?? [];
    } catch (error) {
      throw unwrapError(error, "Failed to load roles");
    }
  },

  getById: async (id: string): Promise<Role> => {
    try {
      const res = await rolesApi.getById(id);
      if (!res.data) throw new Error("Role not found");
      return res.data;
    } catch (error) {
      throw unwrapError(error, "Failed to load role");
    }
  },

  getPermissionModules: async () => {
    try {
      const res = await rolesApi.getPermissionModules();
      if (res.data) {
        return {
          modules: res.data.modules ?? [...ALL_PERMISSION_MODULES],
          actions: (res.data.actions as typeof PERMISSION_ACTIONS) ?? [
            ...PERMISSION_ACTIONS,
          ],
          matrix: res.data.matrix ?? PERMISSION_MODULE_GROUPS,
        };
      }
    } catch {
      // Fall back to static frontend matrix if modules endpoint fails
    }

    return {
      modules: [...ALL_PERMISSION_MODULES],
      actions: [...PERMISSION_ACTIONS],
      matrix: PERMISSION_MODULE_GROUPS,
    };
  },

  create: async (payload: CreateRolePayload): Promise<Role> => {
    try {
      const res = await rolesApi.create({
        name: payload.name,
        description: payload.description ?? "",
        permissions: payload.permissions,
      });
      if (!res.data) throw new Error("Failed to create role");
      return res.data;
    } catch (error) {
      throw unwrapError(error, "Failed to create role");
    }
  },

  update: async (id: string, payload: UpdateRolePayload): Promise<Role> => {
    try {
      const res = await rolesApi.update(id, payload);
      if (!res.data) throw new Error("Role not found");
      return res.data;
    } catch (error) {
      throw unwrapError(error, "Failed to update role");
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await rolesApi.delete(id);
    } catch (error) {
      throw unwrapError(error, "Failed to delete role");
    }
  },
};

export type { Role, RoleListItem };
