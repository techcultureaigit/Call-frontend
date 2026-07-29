import type { ApiResponse } from "@/types/api";
import { apiEndpoints } from "./endpoints";
import { apiDelete, apiGet, apiPost, apiUpload } from "./http";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BackendSurvey = Record<string, any>;

export interface SurveysListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

interface PaginatedResponse {
  success: boolean;
  data: BackendSurvey[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const surveysApi = {
  list: (params?: SurveysListParams) =>
    apiGet<PaginatedResponse>(apiEndpoints.surveys.list, params),

  getById: (id: string) =>
    apiGet<ApiResponse<BackendSurvey>>(apiEndpoints.surveys.detail(id)),

  /** POST /surveys — create (no id) or update (with id in body) */
  save: (payload: Record<string, unknown>) =>
    apiPost<ApiResponse<BackendSurvey>>(apiEndpoints.surveys.list, payload),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(apiEndpoints.surveys.detail(id)),

  duplicate: (id: string) =>
    apiPost<ApiResponse<BackendSurvey>>(apiEndpoints.surveys.duplicate(id)),

  schedule: (id: string, payload: Record<string, unknown>) =>
    apiPost<ApiResponse<BackendSurvey>>(apiEndpoints.surveys.schedule(id), payload),

  unschedule: (id: string) =>
    apiPost<ApiResponse<BackendSurvey>>(apiEndpoints.surveys.unschedule(id)),

  uploadContactFile: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiUpload<ApiResponse<BackendSurvey>>(apiEndpoints.surveys.contactFile(id), fd);
  },

  uploadQuestionsFile: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiUpload<ApiResponse<BackendSurvey>>(apiEndpoints.surveys.questionsFile(id), fd);
  },
};
