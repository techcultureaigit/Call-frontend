import type { ActivityLog } from "@/types/activity-log";
import type { PaginatedResponse } from "@/types";
import { createQueryString } from "@/lib/utils";

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

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ?? "Request failed"
    );
  }
  return res.json() as Promise<T>;
}

export const activityLogsModuleService = {
  async list(params: ActivityLogsListParams = {}) {
    const query = createQueryString(
      params as Record<string, string | number | boolean | undefined>
    );
    const res = await fetch(`/api/activity-logs${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return handleResponse<PaginatedResponse<ActivityLog>>(res);
  },

  async getStats() {
    const res = await fetch("/api/activity-logs?stats=true", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: {
        total: number;
        today: number;
        creates: number;
        updates: number;
        deletes: number;
        withChanges: number;
      };
    }>(res);
    return json.data;
  },

  async getFilterOptions() {
    const res = await fetch("/api/activity-logs?filters=true", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: { actors: { id: string; name: string }[] };
    }>(res);
    return json.data;
  },

  async getById(id: string) {
    const res = await fetch(`/api/activity-logs/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: ActivityLog;
    }>(res);
    return json.data;
  },
};
