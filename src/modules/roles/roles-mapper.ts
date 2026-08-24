import {
  ALL_PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  PERMISSION_MODULE_GROUPS,
  sanitizePermissions,
} from "@/config/permission-modules";
import type { Role, RoleListItem, RolePermissions } from "@/types/role";

/** Normalize legacy nested → flat for UI */
export function normalizeRole<T extends Role>(role: T): T {
  return {
    ...role,
    permissions: sanitizePermissions(role.permissions),
  };
}

export function sanitizeRolePermissions(
  permissions: RolePermissions
): RolePermissions {
  return sanitizePermissions(permissions);
}

export const DEFAULT_PERMISSION_MODULES = {
  modules: [...ALL_PERMISSION_MODULES],
  actions: [...PERMISSION_ACTIONS],
  matrix: PERMISSION_MODULE_GROUPS,
};
