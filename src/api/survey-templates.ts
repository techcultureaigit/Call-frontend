import type { ApiResponse } from "@/types/api";
import type { SurveyTemplate } from "@/types/survey-template";
import { apiEndpoints } from "./endpoints";
import { apiGet } from "./http";

export interface SurveyTemplatesListParams {
  search?: string;
  industry?: string;
}

/** Raw HTTP only — services unwrap `data` */
export const surveyTemplatesApi = {
  list: (params: SurveyTemplatesListParams = {}) =>
    apiGet<ApiResponse<SurveyTemplate[]>>(
      apiEndpoints.surveyTemplates.list,
      {
        search: params.search || undefined,
        industry:
          params.industry && params.industry !== "all"
            ? params.industry
            : undefined,
      }
    ),

  getById: (id: string) =>
    apiGet<ApiResponse<SurveyTemplate>>(
      apiEndpoints.surveyTemplates.detail(id)
    ),
};
