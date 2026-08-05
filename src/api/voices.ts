import type { ApiResponse } from "@/types/api";
import type { BackendVoice } from "@/lib/utils/voice-mapper";
import { apiGet } from "@/lib/api";

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

/** Direct Express `/api/v1/voices` — uses NEXT_PUBLIC_API_URL (port 8000) */
export const voicesApi = {
  list: (params: VoicesListParams = {}) =>
    apiGet<VoicesListResponse>("/voices", { params }),

  getById: (id: string) =>
    apiGet<ApiResponse<BackendVoice>>(`/voices/${id}`),
};
