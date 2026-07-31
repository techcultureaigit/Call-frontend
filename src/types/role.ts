import type { Timestamps, ID } from "./common";
import type { NavModule } from "@/config/permissions";

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "export"
  | "import"
  | "upload"
  | "download"
  | "publish";

export type PermissionModule = NavModule | string;

export interface ModulePermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
  upload: boolean;
  download: boolean;
  publish: boolean;
}

/** Dynamic matrix keyed by backend module ids */
export type RolePermissions = Record<string, ModulePermissions>;

export interface Role extends Timestamps {
  id: ID;
  name: string;
  description: string;
  userCount: number;
  permissions: RolePermissions;
  isSystem?: boolean;
  isSuperAdmin?: boolean;
  canDelete?: boolean;
  canRename?: boolean;
}

export interface RoleListItem extends Role {
  permissionCount: number;
  totalPermissions: number;
}

/** Built-in roles that cannot be deleted (matches backend SYSTEM_ROLE_NAMES) */
export const SYSTEM_ROLE_NAMES = ["Super Admin", "Admin", "Viewer"] as const;

export const SUPER_ADMIN_ROLE_NAME = "Super Admin";

export function isProtectedRole(name: string): boolean {
  return SYSTEM_ROLE_NAMES.some(
    (n) => n.toLowerCase() === name.trim().toLowerCase()
  );
}

/** Super Admin — permissions editable; cannot delete/rename */
export function isSuperAdminRole(name: string): boolean {
  return name.trim().toLowerCase() === SUPER_ADMIN_ROLE_NAME.toLowerCase();
}

/** @deprecated use isProtectedRole — system roles cannot be deleted/renamed */
export function isImmutableRole(role: { name: string; canDelete?: boolean }): boolean {
  if (typeof role.canDelete === "boolean") return !role.canDelete;
  return isProtectedRole(role.name);
}
