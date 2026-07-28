import {
  createEmptyPermissions,
  createFullPermissions,
  emptyModulePermissions,
} from "@/config/permission-modules";
import type { ModulePermissions, Role, RolePermissions } from "@/types/role";

function flags(overrides: Partial<ModulePermissions>): ModulePermissions {
  return { ...emptyModulePermissions(), ...overrides };
}

/** Admin: full operational access; roles read+update only; no settings delete */
function adminPermissions(): RolePermissions {
  const perms = createFullPermissions();

  perms.roles = flags({
    create: true,
    read: true,
    update: true,
  });
  perms.settings = flags({
    create: true,
    read: true,
    update: true,
  });

  return perms;
}

/** Viewer: read-only across sidebar modules they can see (no Users / Roles / Settings) */
function viewerPermissions(): RolePermissions {
  const perms = createEmptyPermissions();

  perms.dashboard = flags({ read: true });
  perms.surveys = flags({ read: true, export: true });
  perms.library = flags({ read: true, download: true });
  perms.customers = flags({ read: true, export: true });
  perms.calls = flags({ read: true, export: true, download: true });
  perms.responses = flags({ read: true, export: true, download: true });
  perms.reports = flags({ read: true, export: true, download: true });
  perms.notifications = flags({ read: true });
  perms.activity_logs = flags({ read: true, export: true, download: true });

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
      "Administrative access to manage users, surveys, calls, and configuration.",
    color: "#4f46e5",
    isSystem: true,
    userCount: 4,
    permissions: adminPermissions(),
    createdAt: "2025-06-01T10:00:00Z",
    updatedAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "role_003",
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
];

export function generateRoleId(): string {
  return `role_${Date.now().toString(36)}`;
}
