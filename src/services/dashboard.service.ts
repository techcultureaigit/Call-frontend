import type { ApiResponse } from "@/types/api";
import type { DashboardData } from "@/types/dashboard";

async function fetchDashboard(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  const json = (await response.json()) as ApiResponse<DashboardData>;
  return json.data;
}

export const dashboardService = {
  getOverview: fetchDashboard,
};
