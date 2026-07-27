import type { ApiResponse } from "@/types/api";
import type { DashboardData } from "@/types/dashboard";
import { apiEndpoints } from "./endpoints";
import { apiGet } from "./http";

export const dashboardApi = {
  getOverview: async () => {
    const json = await apiGet<ApiResponse<DashboardData>>(
      apiEndpoints.dashboard
    );
    return json.data;
  },
};
