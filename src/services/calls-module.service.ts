import { callsApi, type CallsListParams } from "@/api/calls";
import { unwrapData } from "@/api/http";

export type { CallsListParams };

export const callsModuleService = {
  list: (params: CallsListParams = {}) => callsApi.list(params),
  getStats: () => unwrapData(callsApi.getStats()),
  getById: (id: string) => unwrapData(callsApi.getById(id)),
  retry: (id: string) => unwrapData(callsApi.retry(id)),
};
