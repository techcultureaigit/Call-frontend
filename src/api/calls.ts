import type { PaginatedResponse } from "@/types";
import type { ApiResponse } from "@/types/api";
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

export interface CallStats {
  live: number;
  completed: number;
  failed: number;
  withRecording: number;
  total: number;
}

/** Raw HTTP only — services unwrap `data` */
export const callsApi = {
  list: (params: CallsListParams = {}) =>
    apiGet<PaginatedResponse<Call>>(apiEndpoints.calls.list, params),

  getStats: () =>
    apiGet<ApiResponse<CallStats>>(apiEndpoints.calls.list, { stats: true }),

  getById: (id: string) =>
    apiGet<ApiResponse<Call>>(apiEndpoints.calls.detail(id)),

  retry: (id: string) =>
    apiPatch<ApiResponse<Call>>(apiEndpoints.calls.list, {
      action: "retry",
      id,
    }),
};
