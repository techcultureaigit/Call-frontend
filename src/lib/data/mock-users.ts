import { createEmptyPermissions, createFullPermissions } from "@/config/permission-modules";
import type { User } from "@/types/user";
import type { RolePermissions } from "@/types/role";

function viewerPerms(): RolePermissions {
  const p = createEmptyPermissions();
  p.dashboard = { ...p.dashboard, read: true };
  p.survey = { ...p.survey, read: true };
  p.surveys = { ...p.surveys, read: true, export: true };
  p.library = { ...p.library, read: true, download: true };
  p.audio_buffer = { ...p.audio_buffer, read: true, download: true };
  p.customers = { ...p.customers, read: true, export: true };
  p.calls = { ...p.calls, read: true, export: true, download: true };
  p.calls_live = { ...p.calls_live, read: true, export: true, download: true };
  p.calls_history = {
    ...p.calls_history,
    read: true,
    export: true,
    download: true,
  };
  p.calls_recordings = { ...p.calls_recordings, read: true, download: true };
  p.responses = { ...p.responses, read: true, export: true, download: true };
  p.responses_all = {
    ...p.responses_all,
    read: true,
    export: true,
    download: true,
  };
  p.responses_pending = { ...p.responses_pending, read: true, export: true };
  p.responses_flagged = { ...p.responses_flagged, read: true, export: true };
  p.reports = { ...p.reports, read: true, export: true, download: true };
  p.notifications = { ...p.notifications, read: true };
  p.activity_logs = {
    ...p.activity_logs,
    read: true,
    export: true,
    download: true,
  };
  return p;
}

const full = createFullPermissions();
const viewer = viewerPerms();

export const MOCK_USERS: User[] = [
  {
    id: "usr_001",
    email: "sarah.chen@crm.local",
    firstName: "Sarah",
    lastName: "Chen",
    roleId: "role_001",
    roleName: "Super Admin",
    role: "Super Admin",
    permissions: full,
    status: "active",
    phone: "+1 415 555 0101",
    timezone: "America/Los_Angeles",
    lastLoginAt: "2026-03-13T08:30:00Z",
    createdAt: "2025-06-15T10:00:00Z",
    updatedAt: "2026-03-12T14:20:00Z",
  },
  {
    id: "usr_002",
    email: "alex.rivera@crm.local",
    firstName: "Alex",
    lastName: "Rivera",
    roleId: "role_002",
    roleName: "Admin",
    role: "Admin",
    permissions: full,
    status: "active",
    phone: "+1 212 555 0102",
    timezone: "America/New_York",
    lastLoginAt: "2026-03-13T07:15:00Z",
    createdAt: "2025-07-01T10:00:00Z",
    updatedAt: "2026-03-11T09:45:00Z",
  },
  {
    id: "usr_003",
    email: "lisa.thompson@crm.local",
    firstName: "Lisa",
    lastName: "Thompson",
    roleId: "role_003",
    roleName: "Viewer",
    role: "Viewer",
    permissions: viewer,
    status: "active",
    phone: "+1 404 555 0106",
    timezone: "America/New_York",
    lastLoginAt: "2026-03-11T14:30:00Z",
    createdAt: "2025-10-01T10:00:00Z",
    updatedAt: "2026-03-11T14:30:00Z",
  },
  {
    id: "usr_004",
    email: "tom.anderson@crm.local",
    firstName: "Tom",
    lastName: "Anderson",
    roleId: "role_002",
    roleName: "Admin",
    role: "Admin",
    permissions: full,
    status: "active",
    phone: "+1 303 555 0109",
    timezone: "America/Denver",
    lastLoginAt: "2026-03-13T05:20:00Z",
    createdAt: "2025-11-01T10:00:00Z",
    updatedAt: "2026-03-13T05:20:00Z",
  },
  {
    id: "usr_005",
    email: "chris.lee@crm.local",
    firstName: "Chris",
    lastName: "Lee",
    roleId: "role_003",
    roleName: "Viewer",
    role: "Viewer",
    permissions: viewer,
    status: "active",
    phone: "+1 510 555 0111",
    timezone: "America/Los_Angeles",
    lastLoginAt: "2026-03-10T11:00:00Z",
    createdAt: "2025-12-01T10:00:00Z",
    updatedAt: "2026-03-10T11:00:00Z",
  },
];
