import type { PaginatedResponse } from "@/types";
import type { Call } from "@/types/call";
import { apiEndpoints } from "./endpoints";
import { apiGet, apiPatch } from "./http";

export interface CallsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  hasRecording?: boolean;
  liveOnly?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const callsApi = {
  list: (params: CallsListParams = {}) =>
    apiGet<PaginatedResponse<Call>>(apiEndpoints.calls.list, params),

  getStats: async () => {
    const json = await apiGet<{
      success: boolean;
      data: {
        live: number;
        completed: number;
        failed: number;
        withRecording: number;
        total: number;
      };
    }>(apiEndpoints.calls.list, { stats: true });
    return json.data;
  },

  getById: async (id: string) => {
    const json = await apiGet<{ success: boolean; data: Call }>(
      apiEndpoints.calls.detail(id)
    );
    return json.data;
  },

  retry: async (id: string) => {
    const json = await apiPatch<{ success: boolean; data: Call }>(
      apiEndpoints.calls.list,
      { action: "retry", id }
    );
    return json.data;
  },
};
