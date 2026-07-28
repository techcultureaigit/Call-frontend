import { responsesApi, type ResponsesListParams } from "@/api/responses";
import { unwrapData } from "@/api/http";

export type { ResponsesListParams };

export const responsesModuleService = {
  list: (params: ResponsesListParams = {}) => responsesApi.list(params),
  export: (params: Omit<ResponsesListParams, "page" | "limit">) =>
    unwrapData(responsesApi.export(params)),
  getStats: () => unwrapData(responsesApi.getStats()),
  getFilterOptions: () => unwrapData(responsesApi.getFilterOptions()),
  getById: (id: string) => unwrapData(responsesApi.getById(id)),
};
