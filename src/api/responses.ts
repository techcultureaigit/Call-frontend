import type { PaginatedResponse } from "@/types";
import type { ApiResponse } from "@/types/api";
import type { SurveyResponse } from "@/types/response";
import { apiEndpoints } from "./endpoints";
import { apiGet } from "./http";

export interface ResponsesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  campaignId?: string;
  surveyId?: string;
  sentiment?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ResponseStats {
  total: number;
  pending: number;
  flagged: number;
  completed: number;
  positive: number;
}

export interface ResponseFilterOptions {
  campaigns: { id: string; name: string }[];
  surveys: { id: string; name: string }[];
}

/** Raw HTTP only — services unwrap `data` */
export const responsesApi = {
  list: (params: ResponsesListParams = {}) =>
    apiGet<PaginatedResponse<SurveyResponse>>(
      apiEndpoints.responses.list,
      params
    ),

  export: (params: Omit<ResponsesListParams, "page" | "limit">) =>
    apiGet<ApiResponse<SurveyResponse[]>>(apiEndpoints.responses.list, {
      ...params,
      export: "true",
    }),

  getStats: () =>
    apiGet<ApiResponse<ResponseStats>>(apiEndpoints.responses.list, {
      stats: true,
    }),

  getFilterOptions: () =>
    apiGet<ApiResponse<ResponseFilterOptions>>(apiEndpoints.responses.list, {
      filters: true,
    }),

  getById: (id: string) =>
    apiGet<ApiResponse<SurveyResponse>>(apiEndpoints.responses.detail(id)),
};
