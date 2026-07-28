import { reportsApi, type ReportsParams } from "@/api/reports";
import { unwrapData } from "@/api/http";

export type { ReportsParams };

export const reportsModuleService = {
  getData: (params: ReportsParams = {}) =>
    unwrapData(reportsApi.getData(params)),
  getCampaigns: () => unwrapData(reportsApi.getCampaigns()),
};
