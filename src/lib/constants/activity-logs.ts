import type { AuditAction, AuditModule } from "@/types/activity-log";

export const AUDIT_ACTION_OPTIONS: {
  value: AuditAction | "all";
  label: string;
}[] = [
  { value: "all", label: "All actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "bulk_update", label: "Bulk update" },
  { value: "bulk_delete", label: "Bulk delete" },
  { value: "export", label: "Export" },
  { value: "import", label: "Import" },
  { value: "publish", label: "Publish" },
  { value: "pause", label: "Pause" },
  { value: "resume", label: "Resume" },
  { value: "retry", label: "Retry" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
];

export const AUDIT_MODULE_OPTIONS: {
  value: AuditModule | "all";
  label: string;
}[] = [
  { value: "all", label: "All modules" },
  { value: "customers", label: "Customers" },
  { value: "campaigns", label: "Campaigns" },
  { value: "surveys", label: "Surveys" },
  { value: "calls", label: "Calls" },
  { value: "responses", label: "Responses" },
  { value: "users", label: "Users" },
  { value: "roles", label: "Roles" },
  { value: "reports", label: "Reports" },
  { value: "settings", label: "Settings" },
  { value: "auth", label: "Auth" },
];

export const ACTION_BADGE_STYLES: Record<AuditAction, string> = {
  create: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  update: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  delete: "bg-destructive/10 text-destructive",
  export: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  import: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  login: "bg-muted text-muted-foreground",
  logout: "bg-muted text-muted-foreground",
  publish: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  pause: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  resume: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  retry: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  bulk_update: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  bulk_delete: "bg-destructive/10 text-destructive",
};

export const MODULE_BADGE_STYLES: Record<AuditModule, string> = {
  customers: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  campaigns: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  surveys: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  calls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  responses: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  users: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  roles: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  reports: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  settings: "bg-muted text-muted-foreground",
  auth: "bg-muted text-muted-foreground",
};
