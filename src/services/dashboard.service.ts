import { dashboardApi } from "@/api/dashboard";
import { unwrapData } from "@/api/http";

export const dashboardService = {
  getOverview: () => unwrapData(dashboardApi.getOverview()),
};
