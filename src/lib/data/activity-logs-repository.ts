import { MOCK_ACTIVITY_LOGS } from "@/lib/data/mock-activity-logs";
import type { PaginatedMeta, PaginatedResponse } from "@/types";
import type {
  ActivityLog,
  AuditAction,
  AuditModule,
} from "@/types/activity-log";

let activityLogsDB: ActivityLog[] = [...MOCK_ACTIVITY_LOGS];

export interface ActivityLogsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: AuditAction | "all";
  module?: AuditModule | "all";
  actorId?: string | "all";
  sortBy?: "occurredAt" | "summary" | "action" | "module";
  sortOrder?: "asc" | "desc";
}

export function queryActivityLogs(
  params: ActivityLogsQueryParams = {}
): PaginatedResponse<ActivityLog> {
  const {
    page = 1,
    limit = 10,
    search = "",
    action = "all",
    module = "all",
    actorId = "all",
    sortBy = "occurredAt",
    sortOrder = "desc",
  } = params;

  let filtered = [...activityLogsDB];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.summary.toLowerCase().includes(q) ||
        log.resourceName.toLowerCase().includes(q) ||
        log.performedBy.name.toLowerCase().includes(q) ||
        log.performedBy.email.toLowerCase().includes(q) ||
        (log.description?.toLowerCase().includes(q) ?? false) ||
        log.changes.some(
          (c) =>
            c.field.toLowerCase().includes(q) ||
            (c.before?.toLowerCase().includes(q) ?? false) ||
            (c.after?.toLowerCase().includes(q) ?? false)
        )
    );
  }

  if (action !== "all") filtered = filtered.filter((l) => l.action === action);
  if (module !== "all") filtered = filtered.filter((l) => l.module === module);
  if (actorId !== "all")
    filtered = filtered.filter((l) => l.performedBy.id === actorId);

  filtered.sort((a, b) => {
    let aVal = "";
    let bVal = "";
    if (sortBy === "occurredAt") {
      aVal = a.occurredAt;
      bVal = b.occurredAt;
    } else {
      aVal = String(a[sortBy] ?? "");
      bVal = String(b[sortBy] ?? "");
    }
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  const meta: PaginatedMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { data: filtered.slice(start, start + limit), meta };
}

export function getActivityLogById(id: string): ActivityLog | undefined {
  return activityLogsDB.find((l) => l.id === id);
}

export function getActivityLogStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return {
    total: activityLogsDB.length,
    today: activityLogsDB.filter(
      (l) => new Date(l.occurredAt) >= todayStart
    ).length,
    creates: activityLogsDB.filter((l) => l.action === "create").length,
    updates: activityLogsDB.filter((l) => l.action === "update").length,
    deletes: activityLogsDB.filter(
      (l) => l.action === "delete" || l.action === "bulk_delete"
    ).length,
    withChanges: activityLogsDB.filter((l) => l.changes.length > 0).length,
  };
}

export function getActivityLogFilterOptions() {
  const actors = new Map<string, string>();
  activityLogsDB.forEach((l) => {
    actors.set(l.performedBy.id, l.performedBy.name);
  });
  return {
    actors: Array.from(actors.entries()).map(([id, name]) => ({ id, name })),
  };
}

export function getRecentActivityLogs(limit = 5): ActivityLog[] {
  return [...activityLogsDB]
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    )
    .slice(0, limit);
}
