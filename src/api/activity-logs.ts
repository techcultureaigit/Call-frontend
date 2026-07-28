import type { PaginatedResponse } from "@/types";
import type { ApiResponse } from "@/types/api";
import type { ActivityLog } from "@/types/activity-log";
import { apiEndpoints } from "./endpoints";
import { apiGet } from "./http";

export interface ActivityLogsListParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  module?: string;
  actorId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ActivityLogStats {
  total: number;
  today: number;
  creates: number;
  updates: number;
  deletes: number;
  withChanges: number;
}

export interface ActivityLogFilterOptions {
  actors: { id: string; name: string }[];
}

/** Raw HTTP only — services unwrap `data` */
export const activityLogsApi = {
  list: (params: ActivityLogsListParams = {}) =>
    apiGet<PaginatedResponse<ActivityLog>>(
      apiEndpoints.activityLogs.list,
      params
    ),

  getStats: () =>
    apiGet<ApiResponse<ActivityLogStats>>(apiEndpoints.activityLogs.list, {
      stats: true,
    }),

  getFilterOptions: () =>
    apiGet<ApiResponse<ActivityLogFilterOptions>>(
      apiEndpoints.activityLogs.list,
      { filters: true }
    ),

  getById: (id: string) =>
    apiGet<ApiResponse<ActivityLog>>(apiEndpoints.activityLogs.detail(id)),
};
