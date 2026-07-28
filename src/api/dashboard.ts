import type { ApiResponse } from "@/types/api";
import type { DashboardData } from "@/types/dashboard";
import { apiEndpoints } from "./endpoints";
import { apiGet } from "./http";

/** Raw HTTP only — services unwrap `data` */
export const dashboardApi = {
  getOverview: () =>
    apiGet<ApiResponse<DashboardData>>(apiEndpoints.dashboard),
};
