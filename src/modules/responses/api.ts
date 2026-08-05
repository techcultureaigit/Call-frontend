/**
 * api.ts
 * Responses HTTP API — all backend calls live here.
 * Debug: [responses-api] in DevTools console.
 *
 * listResponses()            GET  /api/responses
 * exportResponses()          GET  /api/responses?export=true
 * getResponseStats()         GET  /api/responses?stats=true
 * getResponseFilterOptions() GET  /api/responses?filters=true
 * getResponse()              GET  /api/responses/:id
 */
import { apiGet, unwrapData } from "@/api/http";
import { createModuleApiCall } from "@/lib/api/module-helpers";
import type { PaginatedResponse } from "@/types";
import type { ApiResponse } from "@/types/api";
import type { SurveyResponse } from "@/types/response";
import type {
  ResponseFilterOptions,
  ResponseStats,
  ResponsesListParams,
} from "./responses-types";

export type {
  ResponseFilterOptions,
  ResponseStats,
  ResponsesListParams,
};

const responsesCall = createModuleApiCall("responses");

/* ========== LIST — GET /api/responses ========== */

/** listResponses() → GET /api/responses */
export async function listResponses(params: ResponsesListParams = {}) {
  return responsesCall("listResponses", "GET", "/api/responses", async () => {
    return await apiGet<PaginatedResponse<SurveyResponse>>(
      "/api/responses",
      params
    );
  }, params);
}

/** exportResponses() → GET /api/responses?export=true */
export async function exportResponses(
  params: Omit<ResponsesListParams, "page" | "limit">
) {
  const query = { ...params, export: "true" };
  return responsesCall(
    "exportResponses",
    "GET",
    "/api/responses",
    async () => {
      return await unwrapData(
        apiGet<ApiResponse<SurveyResponse[]>>("/api/responses", query)
      );
    },
    query
  );
}

/** getResponseStats() → GET /api/responses?stats=true */
export async function getResponseStats() {
  const query = { stats: true };
  return responsesCall(
    "getResponseStats",
    "GET",
    "/api/responses",
    async () => {
      return await unwrapData(
        apiGet<ApiResponse<ResponseStats>>("/api/responses", query)
      );
    },
    query
  );
}

/** getResponseFilterOptions() → GET /api/responses?filters=true */
export async function getResponseFilterOptions() {
  const query = { filters: true };
  return responsesCall(
    "getResponseFilterOptions",
    "GET",
    "/api/responses",
    async () => {
      return await unwrapData(
        apiGet<ApiResponse<ResponseFilterOptions>>("/api/responses", query)
      );
    },
    query
  );
}

/* ========== READ — GET /api/responses/:id ========== */

/** getResponse() → GET /api/responses/:id */
export async function getResponse(id: string) {
  const url = `/api/responses/${id}`;
  return responsesCall("getResponse", "GET", url, async () => {
    return await unwrapData(apiGet<ApiResponse<SurveyResponse>>(url));
  }, { id });
}

/* ---------- namespace ---------- */
export const responsesApi = {
  list: listResponses,
  export: exportResponses,
  getStats: getResponseStats,
  getFilterOptions: getResponseFilterOptions,
  getById: getResponse,
};
