import {
  countEnabledPermissions,
  sanitizePermissions,
  slugifyRole,
} from "@/config/permission-modules";
import { MOCK_ROLES, generateRoleId } from "@/lib/data/mock-roles";
import type { Role, RoleListItem, RolePermissions } from "@/types/role";

let rolesDB: Role[] = [...MOCK_ROLES];

export interface RolesQueryParams {
  search?: string;
}

function toListItem(role: Role): RoleListItem {
  const { enabled, total } = countEnabledPermissions(role.permissions);
  return { ...role, permissionCount: enabled, totalPermissions: total };
}

export function queryRoles(params: RolesQueryParams = {}): RoleListItem[] {
  const { search = "" } = params;
  let filtered = [...rolesDB];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (role) =>
        role.name.toLowerCase().includes(q) ||
        role.description.toLowerCase().includes(q) ||
        role.slug.toLowerCase().includes(q)
    );
  }

  return filtered.map(toListItem);
}

export function getRoleById(id: string): Role | undefined {
  return rolesDB.find((role) => role.id === id);
}

export interface CreateRolePayload {
  name: string;
  description: string;
  color?: string;
  permissions: RolePermissions;
}

export function createRole(payload: CreateRolePayload): Role {
  const now = new Date().toISOString();
  const role: Role = {
    id: generateRoleId(),
    name: payload.name,
    slug: slugifyRole(payload.name),
    description: payload.description,
    color: payload.color ?? "#4f46e5",
    isSystem: false,
    userCount: 0,
    permissions: sanitizePermissions(payload.permissions),
    createdAt: now,
    updatedAt: now,
  };
  rolesDB = [...rolesDB, role];
  return role;
}

export function updateRole(
  id: string,
  payload: Partial<CreateRolePayload>
): Role | null {
  const index = rolesDB.findIndex((role) => role.id === id);
  if (index === -1) return null;

  const existing = rolesDB[index];
  const updated: Role = {
    ...existing,
    name: payload.name ?? existing.name,
    slug: payload.name ? slugifyRole(payload.name) : existing.slug,
    description: payload.description ?? existing.description,
    color: payload.color ?? existing.color,
    permissions: payload.permissions
      ? sanitizePermissions(payload.permissions)
      : existing.permissions,
    updatedAt: new Date().toISOString(),
  };

  rolesDB[index] = updated;
  return updated;
}

export function deleteRole(id: string): { success: boolean; message?: string } {
  const role = rolesDB.find((r) => r.id === id);
  if (!role) return { success: false, message: "Role not found" };
  if (role.isSystem) return { success: false, message: "System roles cannot be deleted" };
  if (role.userCount > 0) {
    return { success: false, message: "Cannot delete role with assigned users" };
  }

  rolesDB = rolesDB.filter((r) => r.id !== id);
  return { success: true };
}

export function updateRolePermissions(
  id: string,
  permissions: RolePermissions
): Role | null {
  return updateRole(id, { permissions });
}
