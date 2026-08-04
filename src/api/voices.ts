import type { ApiResponse } from "@/types/api";
import type { BackendVoice } from "@/lib/utils/voice-mapper";
import { apiEndpoints } from "./endpoints";
import { apiGet } from "./http";

export interface VoicesListParams {
  page?: number;
  limit?: number;
  search?: string;
  source?: string;
  language?: string;
  gender?: string;
  category?: string;
  accent?: string;
  age?: string;
  locale?: string;
  useCase?: string;
  descriptive?: string;
}

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

/** Raw HTTP — services map to UI shapes */
export const voicesApi = {
  list: (params: VoicesListParams = {}) =>
    apiGet<VoicesListResponse>(apiEndpoints.voices.list, params),

  getById: (id: string) =>
    apiGet<ApiResponse<BackendVoice>>(apiEndpoints.voices.detail(id)),
};
