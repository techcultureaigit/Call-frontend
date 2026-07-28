import type { ApiResponse } from "@/types/api";
import type {
  CreateSurveyPayload,
  SaveSurveyPayload,
  Survey,
  SurveyDetail,
} from "@/types/survey";
import { apiEndpoints } from "./endpoints";
import { apiDelete, apiGet, apiPatch, apiPost } from "./http";

/** Raw HTTP only — services unwrap `data` */
export const surveysApi = {
  list: (activeOnly = false, search = "") =>
    apiGet<ApiResponse<Survey[]>>(apiEndpoints.surveys.list, {
      active: activeOnly ? "true" : undefined,
      search: search || undefined,
    }),

  getById: (id: string) =>
    apiGet<ApiResponse<SurveyDetail>>(apiEndpoints.surveys.detail(id)),

  create: (payload: CreateSurveyPayload) =>
    apiPost<ApiResponse<SurveyDetail>>(apiEndpoints.surveys.list, payload),

  save: (id: string, payload: SaveSurveyPayload) =>
    apiPatch<ApiResponse<SurveyDetail>>(
      apiEndpoints.surveys.detail(id),
      payload
    ),

  togglePublish: (id: string, published: boolean) =>
    apiPatch<ApiResponse<SurveyDetail>>(apiEndpoints.surveys.detail(id), {
      action: "publish",
      published,
    }),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(apiEndpoints.surveys.detail(id)),
};
