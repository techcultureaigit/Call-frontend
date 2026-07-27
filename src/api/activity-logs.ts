import type { PaginatedResponse } from "@/types";
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

export const activityLogsApi = {
  list: (params: ActivityLogsListParams = {}) =>
    apiGet<PaginatedResponse<ActivityLog>>(
      apiEndpoints.activityLogs.list,
      params
    ),

  getStats: async () => {
    const json = await apiGet<{
      success: boolean;
      data: {
        total: number;
        today: number;
        creates: number;
        updates: number;
        deletes: number;
        withChanges: number;
      };
    }>(apiEndpoints.activityLogs.list, { stats: true });
    return json.data;
  },

  getFilterOptions: async () => {
    const json = await apiGet<{
      success: boolean;
      data: { actors: { id: string; name: string }[] };
    }>(apiEndpoints.activityLogs.list, { filters: true });
    return json.data;
  },

  getById: async (id: string) => {
    const json = await apiGet<{
      success: boolean;
      data: ActivityLog;
    }>(apiEndpoints.activityLogs.detail(id));
    return json.data;
  },
};
