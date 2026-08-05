/**
 * api.ts
 * Calls HTTP API — all backend calls live here.
 * Debug: [calls-api] in DevTools console.
 *
 * listCalls()    GET    /api/calls
 * getCallStats() GET    /api/calls?stats=true
 * getCall()      GET    /api/calls/:id
 * retryCall()    PATCH  /api/calls  (action=retry)
 */
import { apiGet, apiPatch, unwrapData } from "@/api/http";
import { createModuleApiCall } from "@/lib/api/module-helpers";
import type { PaginatedResponse } from "@/types";
import type { ApiResponse } from "@/types/api";
import type { Call } from "@/types/call";
import type { CallStats, CallsListParams } from "./calls-types";

export type { CallStats, CallsListParams };

const callsCall = createModuleApiCall("calls");

/* ========== LIST — GET /api/calls ========== */

/** listCalls() → GET /api/calls */
export async function listCalls(params: CallsListParams = {}) {
  return callsCall("listCalls", "GET", "/api/calls", async () => {
    return await apiGet<PaginatedResponse<Call>>("/api/calls", params);
  }, params);
}

/** getCallStats() → GET /api/calls?stats=true */
export async function getCallStats() {
  return callsCall("getCallStats", "GET", "/api/calls", async () => {
    return await unwrapData(
      apiGet<ApiResponse<CallStats>>("/api/calls", { stats: true })
    );
  }, { stats: true });
}

/* ========== READ — GET /api/calls/:id ========== */

/** getCall() → GET /api/calls/:id */
export async function getCall(id: string) {
  const url = `/api/calls/${id}`;
  return callsCall("getCall", "GET", url, async () => {
    return await unwrapData(apiGet<ApiResponse<Call>>(url));
  }, { id });
}

/* ========== UPDATE — PATCH /api/calls ========== */

/** retryCall() → PATCH /api/calls */
export async function retryCall(id: string) {
  const body = { action: "retry", id };
  return callsCall("retryCall", "PATCH", "/api/calls", async () => {
    return await unwrapData(
      apiPatch<ApiResponse<Call>>("/api/calls", body)
    );
  }, body);
}

/* ---------- namespace ---------- */
export const callsApi = {
  list: listCalls,
  getStats: getCallStats,
  getById: getCall,
  retry: retryCall,
};
