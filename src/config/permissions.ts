import type { UserRole } from "@/types/user";

export type NavModule =
  | "dashboard"
  | "users"
  | "roles"
  | "customers"
  | "surveys"
  | "calls"
  | "responses"
  | "reports"
  | "notifications"
  | "activity_logs"
  | "settings"
  | "agents"
  | "library"
  | "billing"
  | "help";

export const ROLE_MODULE_ACCESS: Record<UserRole, readonly NavModule[]> = {
  super_admin: [
    "dashboard",
    "agents",
    "library",
    "users",
    "roles",
    "customers",
    "surveys",
    "calls",
    "responses",
    "reports",
    "notifications",
    "activity_logs",
    "settings",
    "billing",
    "help",
  ],
  admin: [
    "dashboard",
    "agents",
    "library",
    "users",
    "roles",
    "customers",
    "surveys",
    "calls",
    "responses",
    "reports",
    "notifications",
    "activity_logs",
    "settings",
    "billing",
    "help",
  ],
  manager: [
    "dashboard",
    "agents",
    "library",
    "users",
    "roles",
    "customers",
    "surveys",
    "calls",
    "responses",
    "reports",
    "notifications",
    "activity_logs",
    "settings",
    "billing",
    "help",
  ],
  sales_rep: [
    "dashboard",
    "agents",
    "library",
    "customers",
    "surveys",
    "calls",
    "responses",
    "notifications",
    "help",
  ],
  viewer: [
    "dashboard",
    "reports",
    "responses",
    "notifications",
    "activity_logs",
    "help",
  ],
} as const;

export function hasModuleAccess(
  role: UserRole | undefined,
  module: NavModule
): boolean {
  if (!role) return module === "dashboard";
  return ROLE_MODULE_ACCESS[role].includes(module);
}
