import type { PermissionAction, RolePermissions } from "@/types/role";

/** Modules that appear in the sidebar / permission matrix — must match backend MODULES */
export type NavModule =
  | "dashboard"
  | "survey"
  | "surveys"
  | "voices"
  | "audio_buffer"
  | "survey_data"
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
  "surveys",
  "voices",
  "audio_buffer",
  "survey_data",
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

/** Sidebar / route access — requires at least `read` on the module */
export function hasModuleAccess(
  permissions: RolePermissions | null | undefined,
  module: NavModule
): boolean {
  return can(permissions, module, "read");
}
