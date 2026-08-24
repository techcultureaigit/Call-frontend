/**
 * voices-types.ts — Voices module types (no API calls).
 */
import type { PaginatedMeta } from "@/types";
import type { VoiceFilters, VoiceProfile } from "@/types/voice";

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

export interface VoicesListResult {
  data: VoiceProfile[];
  meta: PaginatedMeta;
}

export type { VoiceFilters, VoiceProfile };
