import type { PaginatedResponse } from "@/types";
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

export const responsesApi = {
  list: (params: ResponsesListParams = {}) =>
    apiGet<PaginatedResponse<SurveyResponse>>(
      apiEndpoints.responses.list,
      params
    ),

  export: async (params: Omit<ResponsesListParams, "page" | "limit">) => {
    const json = await apiGet<{
      success: boolean;
      data: SurveyResponse[];
    }>(apiEndpoints.responses.list, { ...params, export: "true" });
    return json.data;
  },

  getStats: async () => {
    const json = await apiGet<{
      success: boolean;
      data: {
        total: number;
        pending: number;
        flagged: number;
        completed: number;
        positive: number;
      };
    }>(apiEndpoints.responses.list, { stats: true });
    return json.data;
  },

  getFilterOptions: async () => {
    const json = await apiGet<{
      success: boolean;
      data: {
        campaigns: { id: string; name: string }[];
        surveys: { id: string; name: string }[];
      };
    }>(apiEndpoints.responses.list, { filters: true });
    return json.data;
  },

  getById: async (id: string) => {
    const json = await apiGet<{
      success: boolean;
      data: SurveyResponse;
    }>(apiEndpoints.responses.detail(id));
    return json.data;
  },
};
