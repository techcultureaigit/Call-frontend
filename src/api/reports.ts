import type { ReportsData } from "@/types/reports";
import { apiEndpoints } from "./endpoints";
import { apiGet } from "./http";

export interface ReportsParams {
  from?: string;
  to?: string;
  campaignId?: string;
}

export const reportsApi = {
  getData: async (params: ReportsParams = {}) => {
    const json = await apiGet<{ success: boolean; data: ReportsData }>(
      apiEndpoints.reports,
      params
    );
    return json.data;
  },

  getCampaigns: async () => {
    const json = await apiGet<{
      success: boolean;
      data: { id: string; name: string }[];
    }>(apiEndpoints.reports, { campaigns: true });
    return json.data;
  },
};
