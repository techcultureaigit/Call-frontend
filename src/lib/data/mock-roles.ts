import {
  createEmptyPermissions,
  createFullPermissions,
  emptyModulePermissions,
} from "@/config/permission-modules";
import type { ModulePermissions, Role, RolePermissions } from "@/types/role";

function flags(overrides: Partial<ModulePermissions>): ModulePermissions {
  return { ...emptyModulePermissions(), ...overrides };
}

/** Admin: full operational access; no roles.delete / settings.delete */
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

/** Viewer: read-only across modules they can see (no Users / Roles / Settings) */
function viewerPermissions(): RolePermissions {
  const perms = createEmptyPermissions();

  perms.dashboard = flags({ read: true });
  perms.my_surveys = flags({ read: true });
  perms.voices = flags({ read: true, download: true });
  perms.calls = flags({ read: true, download: true });
  perms.calls_live = flags({ read: true, download: true });
  perms.calls_history = flags({ read: true, download: true });
  perms.calls_recordings = flags({ read: true, download: true });
  perms.responses = flags({ read: true, download: true });
  perms.responses_all = flags({ read: true, download: true });
  perms.responses_pending = flags({ read: true });
  perms.responses_flagged = flags({ read: true });
  perms.reports = flags({ read: true, download: true });
  perms.notifications = flags({ read: true });
  perms.activity_logs = flags({ read: true, export: true, download: true });

  return perms;
}

export const MOCK_ROLES: Role[] = [
  {
    id: "role_001",
    name: "Super Admin",
    description:
      "Full system access with unrestricted permissions across all modules.",
    userCount: 2,
    permissions: createFullPermissions(),
    createdAt: "2025-06-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "role_002",
    name: "Admin",
    description:
      "Administrative access to manage users, surveys, calls, and configuration.",
    userCount: 4,
    permissions: adminPermissions(),
    createdAt: "2025-06-01T10:00:00Z",
    updatedAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "role_003",
    name: "Viewer",
    description:
      "Read-only access for stakeholders who need visibility without edit rights.",
    userCount: 8,
    permissions: viewerPermissions(),
    createdAt: "2025-09-01T10:00:00Z",
    updatedAt: "2026-01-20T10:00:00Z",
  },
];

export function generateRoleId(): string {
  return `role_${Date.now().toString(36)}`;
}
