import type {
  CreateSurveyPayload,
  SaveSurveyPayload,
  Survey,
  SurveyDetail,
} from "@/types/survey";
import { apiEndpoints } from "./endpoints";
import { apiDelete, apiGet, apiPatch, apiPost } from "./http";

export const surveysApi = {
  list: async (activeOnly = false, search = "") => {
    const json = await apiGet<{ success: boolean; data: Survey[] }>(
      apiEndpoints.surveys.list,
      {
        active: activeOnly ? "true" : undefined,
        search: search || undefined,
      }
    );
    return json.data;
  },

  getById: async (id: string) => {
    const json = await apiGet<{ success: boolean; data: SurveyDetail }>(
      apiEndpoints.surveys.detail(id)
    );
    return json.data;
  },

  create: async (payload: CreateSurveyPayload) => {
    const json = await apiPost<{ success: boolean; data: SurveyDetail }>(
      apiEndpoints.surveys.list,
      payload
    );
    return json.data;
  },

  save: async (id: string, payload: SaveSurveyPayload) => {
    const json = await apiPatch<{ success: boolean; data: SurveyDetail }>(
      apiEndpoints.surveys.detail(id),
      payload
    );
    return json.data;
  },

  togglePublish: async (id: string, published: boolean) => {
    const json = await apiPatch<{ success: boolean; data: SurveyDetail }>(
      apiEndpoints.surveys.detail(id),
      { action: "publish", published }
    );
    return json.data;
  },

  delete: (id: string) =>
    apiDelete<{ success: boolean }>(apiEndpoints.surveys.detail(id)),
};
