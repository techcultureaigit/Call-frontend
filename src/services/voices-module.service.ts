import { voicesApi, type VoicesListParams } from "@/api/voices";
import { unwrapData } from "@/api/http";
import {
  backendVoiceToProfile,
  toBackendGender,
} from "@/lib/utils/voice-mapper";
import type { PaginatedMeta } from "@/types";
import type { VoiceFilters, VoiceProfile } from "@/types/voice";

export type { VoicesListParams };

export interface VoicesListResult {
  data: VoiceProfile[];
  meta: PaginatedMeta;
}

function toMeta(pagination?: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}): PaginatedMeta {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 12;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
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

export const voicesModuleService = {
  async list(params: VoicesListParams = {}): Promise<VoicesListResult> {
    const res = await voicesApi.list({
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      ...params,
    });

    return {
      data: (res.data ?? []).map(backendVoiceToProfile),
      meta: toMeta(res.pagination),
    };
  },

  async getById(id: string): Promise<VoiceProfile> {
    const voice = await unwrapData(voicesApi.getById(id));
    return backendVoiceToProfile(voice);
  },
};
