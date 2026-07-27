import {
  createEmptyPermissions,
  createFullPermissions,
  emptyModulePermissions,
} from "@/config/permission-modules";
import type { ModulePermissions, Role, RolePermissions } from "@/types/role";

function flags(overrides: Partial<ModulePermissions>): ModulePermissions {
  return { ...emptyModulePermissions(), ...overrides };
}

function managerPermissions(): RolePermissions {
  const perms = createEmptyPermissions();

  perms.dashboard = flags({ read: true });
  perms.users = flags({
    create: true,
    read: true,
    update: true,
    export: true,
  });
  perms.roles = flags({ create: true, read: true, update: true });
  perms.customers = flags({
    create: true,
    read: true,
    update: true,
    export: true,
    import: true,
    upload: true,
  });
  perms.surveys = flags({
    create: true,
    read: true,
    update: true,
    export: true,
    import: true,
    upload: true,
    publish: true,
  });
  perms.agents = flags({
    create: true,
    read: true,
    update: true,
    export: true,
    upload: true,
    publish: true,
  });
  perms.library = flags({
    create: true,
    read: true,
    update: true,
    export: true,
    upload: true,
    download: true,
  });
  perms.calls = flags({
    create: true,
    read: true,
    update: true,
    export: true,
    download: true,
  });
  perms.responses = flags({
    create: true,
    read: true,
    update: true,
    export: true,
    download: true,
  });
  perms.reports = flags({ read: true, export: true, download: true });
  perms.billing = flags({
    read: true,
    update: true,
    export: true,
    download: true,
  });
  perms.notifications = flags({ read: true, update: true });
  perms.activity_logs = flags({ read: true, export: true, download: true });
  perms.settings = flags({ read: true, update: true });

  return perms;
}

function salesRepPermissions(): RolePermissions {
  const perms = createEmptyPermissions();

  perms.dashboard = flags({ read: true });
  perms.customers = flags({
    create: true,
    read: true,
    update: true,
    export: true,
    import: true,
    upload: true,
  });
  perms.surveys = flags({
    create: true,
    read: true,
    update: true,
    export: true,
    upload: true,
  });
  perms.agents = flags({
    create: true,
    read: true,
    update: true,
    upload: true,
  });
  perms.calls = flags({
    create: true,
    read: true,
    update: true,
    download: true,
  });
  perms.responses = flags({
    create: true,
    read: true,
    update: true,
    export: true,
  });
  perms.notifications = flags({ read: true });

  return perms;
}

function viewerPermissions(): RolePermissions {
  const perms = createEmptyPermissions();
  perms.dashboard = flags({ read: true });
  perms.reports = flags({ read: true, export: true, download: true });
  perms.responses = flags({ read: true, export: true });
  perms.notifications = flags({ read: true });
  perms.activity_logs = flags({ read: true, export: true });
  return perms;
}

export const MOCK_ROLES: Role[] = [
  {
    id: "role_001",
    name: "Super Admin",
    slug: "super-admin",
    description:
      "Full system access with unrestricted permissions across all modules.",
    color: "#7c3aed",
    isSystem: true,
    userCount: 2,
    permissions: createFullPermissions(),
    createdAt: "2025-06-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "role_002",
    name: "Admin",
    slug: "admin",
    description:
      "Administrative access to manage users, roles, and system configuration.",
    color: "#4f46e5",
    isSystem: true,
    userCount: 4,
    permissions: createFullPermissions(),
    createdAt: "2025-06-01T10:00:00Z",
    updatedAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "role_003",
    name: "Manager",
    slug: "manager",
    description:
      "Team oversight with campaign management and reporting capabilities.",
    color: "#2563eb",
    isSystem: true,
    userCount: 6,
    permissions: managerPermissions(),
    createdAt: "2025-07-01T10:00:00Z",
    updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "role_004",
    name: "Sales Rep",
    slug: "sales-rep",
    description:
      "Front-line access for customer engagement, calls, and survey execution.",
    color: "#059669",
    isSystem: true,
    userCount: 12,
    permissions: salesRepPermissions(),
    createdAt: "2025-08-01T10:00:00Z",
    updatedAt: "2026-03-05T10:00:00Z",
  },
  {
    id: "role_005",
    name: "Viewer",
    slug: "viewer",
    description:
      "Read-only access for stakeholders who need visibility without edit rights.",
    color: "#6b7280",
    isSystem: true,
    userCount: 8,
    permissions: viewerPermissions(),
    createdAt: "2025-09-01T10:00:00Z",
    updatedAt: "2026-01-20T10:00:00Z",
  },
  {
    id: "role_006",
    name: "Survey Analyst",
    slug: "survey-analyst",
    description: "Specialized role for survey analytics and result analysis.",
    color: "#d97706",
    isSystem: false,
    userCount: 3,
    permissions: (() => {
      const p = createEmptyPermissions();
      p.dashboard = flags({ read: true });
      p.surveys = flags({ read: true, export: true });
      p.reports = flags({ read: true, export: true, download: true });
      p.responses = flags({ read: true, export: true, download: true });
      return p;
    })(),
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-03-08T10:00:00Z",
  },
];

export function generateRoleId(): string {
  return `role_${Date.now().toString(36)}`;
}
