import type { NavModule } from "./permissions";
import type { ModulePermissions, PermissionAction, RolePermissions } from "@/types/role";

export interface PermissionModuleConfig {
  id: NavModule;
  label: string;
  description?: string;
  actions?: PermissionAction[];
}

export interface PermissionModuleGroup {
  id: string;
  label: string;
  modules: PermissionModuleConfig[];
}

export const PERMISSION_ACTIONS: PermissionAction[] = [
  "create",
  "read",
  "update",
  "delete",
];

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  create: "Create",
  read: "Read",
  update: "Update",
  delete: "Delete",
};

export const PERMISSION_MODULE_GROUPS: PermissionModuleGroup[] = [
  {
    id: "core",
    label: "Core",
    modules: [
      { id: "dashboard", label: "Dashboard", actions: ["read"] },
    ],
  },
  {
    id: "management",
    label: "Management",
    modules: [
      { id: "users", label: "Users" },
      { id: "roles", label: "Roles & Permissions" },
    ],
  },
  {
    id: "engagement",
    label: "Engagement",
    modules: [
      { id: "customers", label: "Customers" },
      { id: "campaigns", label: "Campaigns" },
      { id: "surveys", label: "Surveys" },
      { id: "agents", label: "AI Agents" },
      { id: "library", label: "Library" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    modules: [
      { id: "calls", label: "Calls" },
      { id: "responses", label: "Responses" },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    modules: [
      { id: "reports", label: "Reports", actions: ["read"] },
      { id: "billing", label: "Billing", actions: ["read", "update"] },
    ],
  },
  {
    id: "system",
    label: "System",
    modules: [
      { id: "notifications", label: "Notifications", actions: ["read", "update"] },
      { id: "activity_logs", label: "Activity Logs", actions: ["read"] },
      { id: "settings", label: "Settings" },
      { id: "help", label: "Help", actions: ["read"] },
    ],
  },
];

export const ALL_PERMISSION_MODULES: NavModule[] =
  PERMISSION_MODULE_GROUPS.flatMap((group) =>
    group.modules.map((module) => module.id)
  );

export function createEmptyPermissions(): RolePermissions {
  const permissions = {} as RolePermissions;

  ALL_PERMISSION_MODULES.forEach((moduleId) => {
    permissions[moduleId] = {
      create: false,
      read: false,
      update: false,
      delete: false,
    };
  });

  return permissions;
}

export function createFullPermissions(): RolePermissions {
  const permissions = createEmptyPermissions();

  ALL_PERMISSION_MODULES.forEach((moduleId) => {
    const config = PERMISSION_MODULE_GROUPS.flatMap((g) => g.modules).find(
      (m) => m.id === moduleId
    );
    const actions = config?.actions ?? PERMISSION_ACTIONS;

    permissions[moduleId] = {
      create: actions.includes("create"),
      read: actions.includes("read"),
      update: actions.includes("update"),
      delete: actions.includes("delete"),
    };
  });

  return permissions;
}

export function getModuleActions(moduleId: NavModule): PermissionAction[] {
  const config = PERMISSION_MODULE_GROUPS.flatMap((g) => g.modules).find(
    (m) => m.id === moduleId
  );
  return config?.actions ?? PERMISSION_ACTIONS;
}

export function countEnabledPermissions(
  permissions: RolePermissions
): { enabled: number; total: number } {
  let enabled = 0;
  let total = 0;

  ALL_PERMISSION_MODULES.forEach((moduleId) => {
    const actions = getModuleActions(moduleId);
    actions.forEach((action) => {
      total += 1;
      if (permissions[moduleId][action]) enabled += 1;
    });
  });

  return { enabled, total };
}

export function slugifyRole(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sanitizePermissions(
  permissions: Partial<RolePermissions>
): RolePermissions {
  const base = createEmptyPermissions();

  ALL_PERMISSION_MODULES.forEach((moduleId) => {
    const allowedActions = getModuleActions(moduleId);
    const source = permissions[moduleId];

    if (source) {
      allowedActions.forEach((action) => {
        base[moduleId][action] = Boolean(source[action]);
      });
    }
  });

  return base;
}

export type { ModulePermissions };
