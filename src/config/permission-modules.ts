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

/** Global matrix columns — keep lean for a voice survey / calling CRM */
export const PERMISSION_ACTIONS: PermissionAction[] = [
  "create",
  "read",
  "update",
  "delete",
  "export",
  "import",
  "upload",
  "download",
  "publish",
];

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  create: "Create",
  read: "Read",
  update: "Update",
  delete: "Delete",
  export: "Export",
  import: "Import",
  upload: "Upload",
  download: "Download",
  publish: "Publish",
};

const CRUD: PermissionAction[] = ["create", "read", "update", "delete"];

/**
 * Permission matrix groups — mirrors sidebar sections exactly:
 * Dashboard | Survey Studio | Operations | Insights | Management | Configurations
 */
export const PERMISSION_MODULE_GROUPS: PermissionModuleGroup[] = [
  {
    id: "core",
    label: "Core",
    modules: [{ id: "dashboard", label: "Dashboard", actions: ["read"] }],
  },
  {
    id: "survey_studio",
    label: "Survey Studio",
    modules: [
      {
        id: "surveys",
        label: "My Surveys",
        // Create / edit / publish voice surveys
        actions: [...CRUD, "export", "upload", "publish"],
      },
      {
        id: "library",
        label: "Library",
        // Voices + audio buffer
        actions: [...CRUD, "export", "upload", "download"],
      },
      {
        id: "customers",
        label: "Survey Data",
        actions: [...CRUD, "export", "import", "upload"],
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    modules: [
      {
        id: "calls",
        label: "Calls",
        actions: [...CRUD, "export", "download"],
      },
      {
        id: "responses",
        label: "Responses",
        actions: ["read", "export", "download"],
      },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    modules: [
      {
        id: "reports",
        label: "Reports",
        actions: ["read", "export", "download"],
      },
    ],
  },
  {
    id: "management",
    label: "Management",
    modules: [
      {
        id: "users",
        label: "Users",
        actions: [...CRUD, "export"],
      },
      {
        id: "roles",
        label: "Roles",
        actions: CRUD,
      },
    ],
  },
  {
    id: "configurations",
    label: "Configurations",
    modules: [
      {
        id: "notifications",
        label: "Notifications",
        actions: ["read", "update"],
      },
      {
        id: "activity_logs",
        label: "Activity Logs",
        actions: ["read", "export", "download"],
      },
      { id: "settings", label: "Settings", actions: CRUD },
    ],
  },
];

export const ALL_PERMISSION_MODULES: NavModule[] =
  PERMISSION_MODULE_GROUPS.flatMap((group) =>
    group.modules.map((module) => module.id)
  );

export function emptyModulePermissions(): ModulePermissions {
  return {
    create: false,
    read: false,
    update: false,
    delete: false,
    export: false,
    import: false,
    upload: false,
    download: false,
    publish: false,
  };
}

export function createEmptyPermissions(): RolePermissions {
  const permissions = {} as RolePermissions;

  ALL_PERMISSION_MODULES.forEach((moduleId) => {
    permissions[moduleId] = emptyModulePermissions();
  });

  return permissions;
}

export function createFullPermissions(): RolePermissions {
  const permissions = createEmptyPermissions();

  ALL_PERMISSION_MODULES.forEach((moduleId) => {
    const actions = getModuleActions(moduleId);
    const next = emptyModulePermissions();
    actions.forEach((action) => {
      next[action] = true;
    });
    permissions[moduleId] = next;
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
      if (permissions[moduleId]?.[action]) enabled += 1;
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
  permissions: Partial<RolePermissions> | Record<string, Partial<ModulePermissions> | undefined>
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
