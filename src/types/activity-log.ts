import type { ID, Timestamps } from "./common";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "export"
  | "import"
  | "login"
  | "logout"
  | "publish"
  | "pause"
  | "resume"
  | "retry"
  | "bulk_update"
  | "bulk_delete";

export type AuditModule =
  | "customers"
  | "campaigns"
  | "surveys"
  | "calls"
  | "responses"
  | "users"
  | "roles"
  | "reports"
  | "settings"
  | "auth";

export interface AuditChange {
  field: string;
  before: string | null;
  after: string | null;
}

export interface AuditActor {
  id: ID;
  name: string;
  email: string;
  role: string;
}

export interface ActivityLog extends Timestamps {
  id: ID;
  action: AuditAction;
  module: AuditModule;
  resourceType: string;
  resourceId: ID;
  resourceName: string;
  summary: string;
  description?: string;
  performedBy: AuditActor;
  ipAddress?: string;
  userAgent?: string;
  changes: AuditChange[];
  occurredAt: string;
}
