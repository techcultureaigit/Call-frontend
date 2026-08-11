import type { PermissionAction, RolePermissions } from "@/types/role";
import {
  isIndicatorModule,
  walkPermissionModules,
} from "@/config/permission-modules";

/** Modules that appear in the sidebar / permission matrix — must match backend */
export type NavModule =
  | "dashboard"
  | "survey"
  | "my_surveys"
  | "voices"
  | "providers"
  | "calls"
  | "calls_live"
  | "calls_history"
  | "calls_recordings"
  | "responses"
  | "responses_all"
  | "responses_pending"
  | "responses_flagged"
  | "reports"
  | "users"
  | "roles"
  | "notifications"
  | "activity_logs"
  | "settings";

export const SIDEBAR_MODULES: readonly NavModule[] = [
  "dashboard",
  "survey",
  "my_surveys",
  "voices",
  "providers",
  "calls",
  "calls_live",
  "calls_history",
  "calls_recordings",
  "responses",
  "responses_all",
  "responses_pending",
  "responses_flagged",
  "reports",
  "users",
  "roles",
  "notifications",
  "activity_logs",
  "settings",
] as const;

/** Check a specific module action against the session permission matrix */
export function can(
  permissions: RolePermissions | null | undefined,
  module: string,
  action: PermissionAction = "read"
): boolean {
  if (!permissions) return false;
  return Boolean(permissions[module]?.[action]);
}

/**
 * Sidebar / route access.
 * Indicators (survey/calls/responses): any child with `read` counts as access.
 * Leaf modules: require `read` on that key.
 */
export function hasModuleAccess(
  permissions: RolePermissions | null | undefined,
  module: NavModule
): boolean {
  if (!permissions) return false;
  if (can(permissions, module, "read")) return true;

  if (!isIndicatorModule(module)) return false;

  const config = walkPermissionModules().find((m) => m.id === module);
  return (
    config?.children?.some((child) => can(permissions, child.id, "read")) ??
    false
  );
}
