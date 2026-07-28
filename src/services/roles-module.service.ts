import {
  createRole as createRoleInRepo,
  deleteRole as deleteRoleInRepo,
  getRoleById,
  queryRoles,
  updateRole as updateRoleInRepo,
} from "@/lib/data/roles-repository";
import {
  ALL_PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  PERMISSION_MODULE_GROUPS,
} from "@/config/permission-modules";
import type { Role, RoleListItem, RolePermissions } from "@/types/role";

export interface CreateRolePayload {
  name: string;
  description?: string;
  color?: string;
  permissions: RolePermissions;
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

/** Static / in-memory roles — no backend API. Swap to API later. */
export const rolesModuleService = {
  list: async (search = ""): Promise<RoleListItem[]> => {
    await delay(200);
    return queryRoles({ search });
  },

  getById: async (id: string): Promise<Role> => {
    await delay(120);
    const role = getRoleById(id);
    if (!role) throw new Error("Role not found");
    return role;
  },

  getPermissionModules: async () => {
    await delay(80);
    return {
      modules: [...ALL_PERMISSION_MODULES],
      actions: [...PERMISSION_ACTIONS],
      matrix: PERMISSION_MODULE_GROUPS,
    };
  },

  create: async (payload: CreateRolePayload): Promise<Role> => {
    await delay(250);
    return createRoleInRepo({
      name: payload.name,
      description: payload.description ?? "",
      color: payload.color,
      permissions: payload.permissions,
    });
  },

  update: async (id: string, payload: UpdateRolePayload): Promise<Role> => {
    await delay(250);
    const role = updateRoleInRepo(id, {
      name: payload.name,
      description: payload.description,
      color: payload.color,
      permissions: payload.permissions,
    });
    if (!role) throw new Error("Role not found");
    return role;
  },

  delete: async (id: string): Promise<void> => {
    await delay(200);
    const result = deleteRoleInRepo(id);
    if (!result.success) {
      throw new Error(result.message || "Failed to delete role");
    }
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type { Role, RoleListItem };
