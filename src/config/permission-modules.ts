import type { NavModule } from "./permissions";
import type { ModulePermissions, PermissionAction, RolePermissions } from "@/types/role";

export interface PermissionModuleConfig {
  id: NavModule;
  label: string;
  description?: string;
  actions?: PermissionAction[];
  /** Nested submodules — each has its own create/read/update/… row */
  children?: PermissionModuleConfig[];
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

/** Full CRUD — My Surveys, Voices, Audio Buffer, Users, Roles, Settings */
const CRUD: PermissionAction[] = ["create", "read", "update", "delete"];

/** Full action set for overall parent modules (Survey / Calls / Responses) */
const MODULE_FULL: PermissionAction[] = [...PERMISSION_ACTIONS];

/**
 * Permission matrix — category → parent → subcategory (mirrors sidebar + Roles UI).
 *
 * SURVEY → Survey → My Surveys (CRUD), Voices (CRUD+dl), Audio Buffer (CRUD), Survey Data
 * OPERATIONS → Calls → Live/History/Recordings | Responses → All/Pending/Flagged
 */
export const PERMISSION_MODULE_GROUPS: PermissionModuleGroup[] = [
  {
    id: "core",
    label: "Core",
    modules: [{ id: "dashboard", label: "Dashboard", actions: ["read"] }],
  },
  {
    id: "survey",
    label: "Survey",
    modules: [
      {
        id: "survey",
        label: "Survey",
        description: "Overall Survey module permissions",
        actions: MODULE_FULL,
        children: [
          {
            id: "surveys",
            label: "My Surveys",
            description: "Create, read, update, delete surveys",
            actions: [...CRUD],
          },
          {
            id: "voices",
            label: "Voices",
            description: "Create, read, update, delete voices",
            actions: [...CRUD, "download"],
          },
          {
            id: "audio_buffer",
            label: "Audio Buffer",
            description: "Create, read, update, delete cached audio",
            actions: [...CRUD],
          },
          {
            id: "survey_data",
            label: "Survey Data",
            description: "Create, read, update, delete contacts",
            actions: [...CRUD, "export", "import", "download"],
          },
        ],
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
        description: "Overall Calls module permissions",
        actions: MODULE_FULL,
        children: [
          {
            id: "calls_live",
            label: "Live Calls",
            actions: [...CRUD, "download"],
          },
          {
            id: "calls_history",
            label: "History",
            actions: [...CRUD, "download"],
          },
          {
            id: "calls_recordings",
            label: "Recordings",
            actions: [...CRUD, "download"],
          },
        ],
      },
      {
        id: "responses",
        label: "Responses",
        description: "Overall Responses module permissions",
        actions: MODULE_FULL,
        children: [
          {
            id: "responses_all",
            label: "All Responses",
            actions: ["read", "update", "delete", "download"],
          },
          {
            id: "responses_pending",
            label: "Pending",
            actions: ["read", "update", "delete"],
          },
          {
            id: "responses_flagged",
            label: "Flagged",
            actions: ["read", "update", "delete"],
          },
        ],
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
        actions: ["read", "download"],
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
        actions: [...CRUD],
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
      {
        id: "settings",
        label: "Settings",
        actions: [...CRUD],
      },
    ],
  },
];

/** Depth-first flatten of modules + nested children */
export function flattenPermissionModules(
  modules: PermissionModuleConfig[]
): PermissionModuleConfig[] {
  return modules.flatMap((module) => [
    module,
    ...(module.children ? flattenPermissionModules(module.children) : []),
  ]);
}

export function walkPermissionModules(
  groups: PermissionModuleGroup[] = PERMISSION_MODULE_GROUPS
): PermissionModuleConfig[] {
  return groups.flatMap((group) => flattenPermissionModules(group.modules));
}

export const ALL_PERMISSION_MODULES: NavModule[] = walkPermissionModules().map(
  (module) => module.id
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

export function getModuleActions(moduleId: NavModule | string): PermissionAction[] {
  const config = walkPermissionModules().find((m) => m.id === moduleId);
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
  const aliases: Record<string, string> = {
    library: "voices",
    customers: "survey_data",
  };

  ALL_PERMISSION_MODULES.forEach((moduleId) => {
    const legacyKey = Object.entries(aliases).find(
      ([, neu]) => neu === moduleId
    )?.[0];
    const source =
      permissions[moduleId] ||
      (legacyKey ? permissions[legacyKey] : undefined);
    const allowedActions = getModuleActions(moduleId);

    if (source) {
      allowedActions.forEach((action) => {
        base[moduleId][action] = Boolean(source[action]);
      });
    }
  });

  return base;
}

export type { ModulePermissions };
