import type { ApiResponse } from "@/types/api";
import type { ReportsData } from "@/types/reports";
import { apiEndpoints } from "./endpoints";
import { apiGet } from "./http";

export interface ReportsParams {
  from?: string;
  to?: string;
  campaignId?: string;
}

/** Raw HTTP only — services unwrap `data` */
export const reportsApi = {
  getData: (params: ReportsParams = {}) =>
    apiGet<ApiResponse<ReportsData>>(apiEndpoints.reports, params),

  getCampaigns: () =>
    apiGet<ApiResponse<{ id: string; name: string }[]>>(apiEndpoints.reports, {
      campaigns: true,
    }),
};
