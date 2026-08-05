/**
 * api.ts
 * Dashboard HTTP API — all backend calls live here.
 * Debug: [dashboard-api] in DevTools console.
 *
 * getDashboard() → GET /api/dashboard
 */
import { apiGet, unwrapData } from "@/api/http";
import { createModuleApiCall } from "@/lib/api/module-helpers";
import type { ApiResponse } from "@/types/api";
import type { DashboardData } from "@/types/dashboard";

const dashboardCall = createModuleApiCall("dashboard");

/* ========== READ — GET /api/dashboard ========== */

/** getDashboard() → GET /api/dashboard */
export async function getDashboard() {
  return dashboardCall("getDashboard", "GET", "/api/dashboard", async () => {
    return await unwrapData(
      apiGet<ApiResponse<DashboardData>>("/api/dashboard")
    );
  });
}

/* ---------- namespace ---------- */
export const dashboardApi = {
  getOverview: getDashboard,
};
