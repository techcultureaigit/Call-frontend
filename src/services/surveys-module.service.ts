import { surveysApi } from "@/api/surveys";
import { unwrapData } from "@/api/http";
import type { CreateSurveyPayload, SaveSurveyPayload } from "@/types/survey";

export const surveysModuleService = {
  list: (activeOnly = false, search = "") =>
    unwrapData(surveysApi.list(activeOnly, search)),
  getById: (id: string) => unwrapData(surveysApi.getById(id)),
  create: (payload: CreateSurveyPayload) =>
    unwrapData(surveysApi.create(payload)),
  save: (id: string, payload: SaveSurveyPayload) =>
    unwrapData(surveysApi.save(id, payload)),
  togglePublish: (id: string, published: boolean) =>
    unwrapData(surveysApi.togglePublish(id, published)),
  delete: (id: string) => unwrapData(surveysApi.delete(id)),
};
