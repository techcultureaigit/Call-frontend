import {
  surveyTemplatesApi,
  type SurveyTemplatesListParams,
} from "@/api/survey-templates";
import { unwrapData } from "@/api/http";

export type { SurveyTemplatesListParams };

export const surveyTemplatesModuleService = {
  list: (params: SurveyTemplatesListParams = {}) =>
    unwrapData(surveyTemplatesApi.list(params)),
  getById: (id: string) => unwrapData(surveyTemplatesApi.getById(id)),
};
