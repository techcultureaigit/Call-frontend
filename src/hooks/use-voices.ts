"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  filtersToVoicesParams,
  voicesModuleService,
} from "@/services/voices-module.service";
import type { VoiceFilters } from "@/types/voice";

/** Backend voice sources we sync today */
const VOICE_SOURCES = new Set(["google", "elevenlabs"]);

export function useVoices(
  filters: VoiceFilters,
  page: number,
  limit: number,
  options?: { enabled?: boolean }
) {
  const params = filtersToVoicesParams(filters, page, limit);
  const sourceOk =
    !filters.source ||
    filters.source === "google" ||
    filters.source === "elevenlabs";

  return useQuery({
    queryKey: queryKeys.voices.list(params as Record<string, unknown>),
    queryFn: () => voicesModuleService.list(params),
    staleTime: 30_000,
    enabled: (options?.enabled ?? true) && sourceOk,
  });
}

/** Voices for TTS dropdown — filtered by survey language + TTS provider */
export function useVoiceOptions(language: string, ttsProvider: string) {
  const source = VOICE_SOURCES.has(ttsProvider) ? ttsProvider : "";

  return useQuery({
    queryKey: queryKeys.voices.list({
      language,
      source,
      page: 1,
      limit: 100,
    }),
    queryFn: () =>
      voicesModuleService.list({
        language: language || undefined,
        source: source || undefined,
        page: 1,
        limit: 100,
      }),
    enabled: Boolean(language && source),
    staleTime: 60_000,
  });
}

export function useVoiceDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.voices.detail(id ?? ""),
    queryFn: () => voicesModuleService.getById(id!),
    enabled: Boolean(id),
  });
}
