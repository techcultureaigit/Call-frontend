/**
 * roles-types.ts — Roles module types (no API calls).
 */
import type { Role, RoleListItem, RolePermissions } from "@/types/role";

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: RolePermissions;
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

export type { Role, RoleListItem, RolePermissions };
