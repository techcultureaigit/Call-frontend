import {
  createEmptyPermissions,
  createFullPermissions,
  slugifyRole,
} from "@/config/permission-modules";
import type { Role, RolePermissions } from "@/types/role";

function managerPermissions(): RolePermissions {
  const perms = createEmptyPermissions();
  const full = [
    "dashboard", "users", "roles", "customers",
    "surveys", "calls", "responses", "reports", "notifications", "activity_logs",
  ] as const;

  full.forEach((mod) => {
    perms[mod] = { create: true, read: true, update: true, delete: false };
  });
  perms.settings = { create: false, read: true, update: true, delete: false };
  perms.dashboard = { create: false, read: true, update: false, delete: false };
  perms.reports = { create: false, read: true, update: false, delete: false };
  perms.activity_logs = { create: false, read: true, update: false, delete: false };
  perms.notifications = { create: false, read: true, update: true, delete: false };
  return perms;
}

function salesRepPermissions(): RolePermissions {
  const perms = createEmptyPermissions();
  ["dashboard", "customers", "surveys", "calls", "responses", "notifications"].forEach((mod) => {
    const m = mod as keyof RolePermissions;
    perms[m] = { create: true, read: true, update: true, delete: false };
  });
  perms.dashboard = { create: false, read: true, update: false, delete: false };
  perms.notifications = { create: false, read: true, update: false, delete: false };
  return perms;
}

function viewerPermissions(): RolePermissions {
  const perms = createEmptyPermissions();
  ["dashboard", "reports", "responses", "notifications", "activity_logs"].forEach((mod) => {
    const m = mod as keyof RolePermissions;
    perms[m] = { create: false, read: true, update: false, delete: false };
  });
  return perms;
}

export const MOCK_ROLES: Role[] = [
  {
    id: "role_001",
    name: "Super Admin",
    slug: "super-admin",
    description: "Full system access with unrestricted permissions across all modules.",
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
    description: "Administrative access to manage users, roles, and system configuration.",
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
    description: "Team oversight with campaign management and reporting capabilities.",
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
    description: "Front-line access for customer engagement, calls, and survey execution.",
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
    description: "Read-only access for stakeholders who need visibility without edit rights.",
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
      p.dashboard = { create: false, read: true, update: false, delete: false };
      p.surveys = { create: false, read: true, update: false, delete: false };
      p.reports = { create: false, read: true, update: false, delete: false };
      p.responses = { create: false, read: true, update: false, delete: false };
      return p;
    })(),
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-03-08T10:00:00Z",
  },
];

export function generateRoleId(): string {
  return `role_${Date.now().toString(36)}`;
}
