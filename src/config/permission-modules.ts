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

/**
 * Permission matrix UI — indicator (no CRUD) → leaf modules (CRUD).
 * Storage is FLAT leaf keys only. survey/calls/responses are labels for cascade UI.
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
        actions: [],
        children: [
          {
            id: "my_surveys",
            label: "My Surveys",
            description: "Survey campaigns",
            actions: [...CRUD, "export"],
          },
          {
            id: "voices",
            label: "Voices",
            description: "Voice library",
            actions: [...CRUD, "download"],
          },
          {
            id: "audio_buffer",
            label: "Audio Buffer",
            description: "Cached audio",
            actions: [...CRUD],
          },
          {
            id: "survey_data",
            label: "Survey Data",
            description: "Contacts",
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
        actions: [],
        children: [
          {
            id: "calls_live",
            label: "Live Calls",
            description: "Active calls",
            actions: [...CRUD, "download"],
          },
          {
            id: "calls_history",
            label: "History",
            description: "Past calls",
            actions: [...CRUD, "download"],
          },
          {
            id: "calls_recordings",
            label: "Recordings",
            description: "Call audio",
            actions: [...CRUD, "download"],
          },
        ],
      },
      {
        id: "responses",
        label: "Responses",
        actions: [],
        children: [
          {
            id: "responses_all",
            label: "All Responses",
            description: "Full inbox",
            actions: ["read", "update", "delete", "download"],
          },
          {
            id: "responses_pending",
            label: "Pending",
            description: "Awaiting follow-up",
            actions: ["read", "update", "delete"],
          },
          {
            id: "responses_flagged",
            label: "Flagged",
            description: "Marked for review",
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
        description: "Analytics",
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
        description: "Team accounts",
        actions: [...CRUD, "export"],
      },
      {
        id: "roles",
        label: "Roles",
        description: "Access control",
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
        description: "Alerts",
        actions: ["read", "update"],
      },
      {
        id: "activity_logs",
        label: "Activity Logs",
        description: "Audit trail",
        actions: ["read", "export", "download"],
      },
      {
        id: "settings",
        label: "Settings",
        description: "App config",
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

/** Leaf modules that store CRUD in Role.permissions (excludes indicators) */
export const ALL_PERMISSION_MODULES: NavModule[] = walkPermissionModules()
  .filter((module) => (module.actions?.length ?? 0) > 0)
  .map((module) => module.id);

export function isIndicatorModule(moduleId: string): boolean {
  const config = walkPermissionModules().find((m) => m.id === moduleId);
  return Boolean(config?.children?.length) && !(config?.actions?.length);
}

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
  if (!config) return PERMISSION_ACTIONS;
  return config.actions ?? [];
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

const MODULE_ALIASES: Record<string, string> = {
  library: "voices",
  customers: "survey_data",
  surveys: "my_surveys",
};

function getParentId(moduleId: string): string | null {
  for (const mod of walkPermissionModules()) {
    if (mod.children?.some((c) => c.id === moduleId)) return mod.id;
  }
  return null;
}

function pickActions(
  source: Partial<ModulePermissions> | Record<string, unknown> | undefined,
  moduleId: string
): ModulePermissions {
  const next = emptyModulePermissions();
  if (!source) return next;
  getModuleActions(moduleId).forEach((action) => {
    next[action] = Boolean(source[action]);
  });
  return next;
}

/**
 * Any shape → flat RolePermissions (supports legacy nested docs).
 * DB/API store flat leaf keys only (my_surveys, voices, calls_live, …).
 */
export function flattenPermissions(
  incoming:
    | Partial<RolePermissions>
    | Record<string, unknown>
    | null
    | undefined
): RolePermissions {
  const base = createEmptyPermissions();
  if (!incoming || typeof incoming !== "object") return base;

  const raw = incoming as Record<string, unknown>;

  ALL_PERMISSION_MODULES.forEach((moduleId) => {
    const parentId = getParentId(moduleId);
    const alias = Object.entries(MODULE_ALIASES).find(
      ([, neu]) => neu === moduleId
    )?.[0];

    let source: Record<string, unknown> | undefined;

    // Legacy nested: survey.my_surveys
    if (parentId && raw[parentId] && typeof raw[parentId] === "object") {
      const parent = raw[parentId] as Record<string, unknown>;
      if (parent[moduleId] && typeof parent[moduleId] === "object") {
        source = parent[moduleId] as Record<string, unknown>;
      } else if (alias && parent[alias] && typeof parent[alias] === "object") {
        source = parent[alias] as Record<string, unknown>;
      }
    }

    if (!source && raw[moduleId] && typeof raw[moduleId] === "object") {
      source = raw[moduleId] as Record<string, unknown>;
    }
    if (!source && alias && raw[alias] && typeof raw[alias] === "object") {
      source = raw[alias] as Record<string, unknown>;
    }

    base[moduleId] = pickActions(source, moduleId);
  });

  return base;
}

/** Always flat for matrix / session / save */
export function sanitizePermissions(
  permissions:
    | Partial<RolePermissions>
    | Record<string, Partial<ModulePermissions> | undefined>
    | Record<string, unknown>
): RolePermissions {
  return flattenPermissions(permissions);
}

export type { ModulePermissions };
