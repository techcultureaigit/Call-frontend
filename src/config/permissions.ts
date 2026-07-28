import type { PermissionAction, RolePermissions } from "@/types/role";

/** Modules that appear in the sidebar — must match backend MODULES */
export type NavModule =
  | "dashboard"
  | "surveys"
  | "library"
  | "customers"
  | "calls"
  | "responses"
  | "reports"
  | "users"
  | "roles"
  | "notifications"
  | "activity_logs"
  | "settings";

export const SIDEBAR_MODULES: readonly NavModule[] = [
  "dashboard",
  "surveys",
  "library",
  "customers",
  "calls",
  "responses",
  "reports",
  "users",
  "roles",
  "notifications",
  "activity_logs",
  "settings",
] as const;

/**
 * Permission helpers — currently open (no frontend RBAC).
 * Wire these to API role.permissions later.
 */
export function can(
  _permissions: RolePermissions | null | undefined,
  _module: string,
  _action: PermissionAction = "read"
): boolean {
  return true;
}

export function hasModuleAccess(
  _permissions: RolePermissions | null | undefined,
  _module: NavModule
): boolean {
  return true;
}
