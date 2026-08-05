/**
 * api.ts
 * Reports HTTP API — all backend calls live here.
 * Debug: [reports-api] in DevTools console.
 *
 * getReports()         GET  /api/reports
 * getReportCampaigns() GET  /api/reports?campaigns=true
 */
import { apiGet, unwrapData } from "@/api/http";
import { createModuleApiCall } from "@/lib/api/module-helpers";
import type { ApiResponse } from "@/types/api";
import type { ReportsData } from "@/types/reports";
import type { ReportsParams } from "./reports-types";

export type { ReportsParams };

const reportsCall = createModuleApiCall("reports");

/* ========== READ — GET /api/reports ========== */

/** getReports() → GET /api/reports */
export async function getReports(params: ReportsParams = {}) {
  return reportsCall("getReports", "GET", "/api/reports", async () => {
    return await unwrapData(
      apiGet<ApiResponse<ReportsData>>("/api/reports", params)
    );
  }, params);
}

/** getReportCampaigns() → GET /api/reports?campaigns=true */
export async function getReportCampaigns() {
  const query = { campaigns: true };
  return reportsCall(
    "getReportCampaigns",
    "GET",
    "/api/reports",
    async () => {
      return await unwrapData(
        apiGet<ApiResponse<{ id: string; name: string }[]>>(
          "/api/reports",
          query
        )
      );
    },
    query
  );
}

/* ---------- namespace ---------- */
export const reportsApi = {
  getData: getReports,
  getCampaigns: getReportCampaigns,
};
