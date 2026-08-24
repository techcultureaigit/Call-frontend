/**
 * api.ts
 * Activity logs HTTP API — all backend calls live here.
 * Debug: [activity-logs-api] in DevTools console.
 *
 * listActivityLogs()            GET  /api/activity-logs
 * getActivityLogStats()         GET  /api/activity-logs?stats=true
 * getActivityLogFilterOptions() GET  /api/activity-logs?filters=true
 * getActivityLog()              GET  /api/activity-logs/:id
 */
import { apiGet, unwrapData } from "@/api/http";
import { createModuleApiCall } from "@/lib/api/module-helpers";
import type { PaginatedResponse } from "@/types";
import type { ApiResponse } from "@/types/api";
import type { ActivityLog } from "@/types/activity-log";
import type {
  ActivityLogFilterOptions,
  ActivityLogStats,
  ActivityLogsListParams,
} from "./activity-logs-types";

export type {
  ActivityLogFilterOptions,
  ActivityLogStats,
  ActivityLogsListParams,
};

const activityLogsCall = createModuleApiCall("activity-logs");

/* ========== LIST — GET /api/activity-logs ========== */

/** listActivityLogs() → GET /api/activity-logs */
export async function listActivityLogs(
  params: ActivityLogsListParams = {}
) {
  return activityLogsCall(
    "listActivityLogs",
    "GET",
    "/api/activity-logs",
    async () => {
      return await apiGet<PaginatedResponse<ActivityLog>>(
        "/api/activity-logs",
        params
      );
    },
    params
  );
}

/** getActivityLogStats() → GET /api/activity-logs?stats=true */
export async function getActivityLogStats() {
  const query = { stats: true };
  return activityLogsCall(
    "getActivityLogStats",
    "GET",
    "/api/activity-logs",
    async () => {
      return await unwrapData(
        apiGet<ApiResponse<ActivityLogStats>>("/api/activity-logs", query)
      );
    },
    query
  );
}

/** getActivityLogFilterOptions() → GET /api/activity-logs?filters=true */
export async function getActivityLogFilterOptions() {
  const query = { filters: true };
  return activityLogsCall(
    "getActivityLogFilterOptions",
    "GET",
    "/api/activity-logs",
    async () => {
      return await unwrapData(
        apiGet<ApiResponse<ActivityLogFilterOptions>>(
          "/api/activity-logs",
          query
        )
      );
    },
    query
  );
}

/* ========== READ — GET /api/activity-logs/:id ========== */

/** getActivityLog() → GET /api/activity-logs/:id */
export async function getActivityLog(id: string) {
  const url = `/api/activity-logs/${id}`;
  return activityLogsCall("getActivityLog", "GET", url, async () => {
    return await unwrapData(apiGet<ApiResponse<ActivityLog>>(url));
  }, { id });
}

/* ---------- namespace ---------- */
export const activityLogsApi = {
  list: listActivityLogs,
  getStats: getActivityLogStats,
  getFilterOptions: getActivityLogFilterOptions,
  getById: getActivityLog,
};
