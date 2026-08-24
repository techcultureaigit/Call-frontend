/**
 * api.ts
 * Voices HTTP API — all backend calls live here.
 * Debug: [voices-api] in DevTools console.
 *
 * listVoices()  GET  /api/voices
 * getVoice()    GET  /api/voices/:id
 */
import { apiGet } from "@/api/http";
import {
  createModuleApiCall,
  toPaginatedMeta,
} from "@/lib/api/module-helpers";
import type { ApiResponse } from "@/types/api";
import type { VoiceFilters } from "@/types/voice";
import {
  backendVoiceToProfile,
  toBackendGender,
  type BackendVoice,
} from "./voice-mapper";
import type { VoicesListParams, VoicesListResult } from "./voices-types";

export type { VoicesListParams, VoicesListResult };

const voicesCall = createModuleApiCall("voices");

interface VoicesListResponse {
  success: boolean;
  data: BackendVoice[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ========== LIST — GET /api/voices ========== */

/** listVoices() → GET /api/voices */
export async function listVoices(
  params: VoicesListParams = {}
): Promise<VoicesListResult> {
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 12,
    ...params,
  };
  return voicesCall("listVoices", "GET", "/api/voices", async () => {
    const res = await apiGet<VoicesListResponse>("/api/voices", query);
    return {
      data: (res.data ?? []).map(backendVoiceToProfile),
      meta: toPaginatedMeta(res.pagination, 12),
    };
  }, query);
}

/* ========== READ — GET /api/voices/:id ========== */

/** getVoice() → GET /api/voices/:id */
export async function getVoice(id: string) {
  const url = `/api/voices/${id}`;
  return voicesCall("getVoice", "GET", url, async () => {
    const res = await apiGet<ApiResponse<BackendVoice>>(url);
    if (!res.data) throw new Error("Voice not found");
    return backendVoiceToProfile(res.data);
  }, { id });
}

/** Map UI filters → backend query params */
export function filtersToVoicesParams(
  filters: VoiceFilters,
  page: number,
  limit: number
): VoicesListParams {
  return {
    page,
    limit,
    search: filters.search.trim() || undefined,
    language: filters.language || undefined,
    source: filters.source || undefined,
    gender: toBackendGender(filters.gender),
  };
}

/* ---------- namespace ---------- */
export const voicesApi = {
  list: listVoices,
  getById: getVoice,
  filtersToParams: filtersToVoicesParams,
};
