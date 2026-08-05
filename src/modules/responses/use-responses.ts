"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  exportResponses,
  getResponse,
  getResponseFilterOptions,
  getResponseStats,
  listResponses,
  type ResponsesListParams,
} from "./api";

export function useResponses(params: ResponsesListParams) {
  return useQuery({
    queryKey: queryKeys.responses.module(params as Record<string, unknown>),
    queryFn: () => listResponses(params),
    placeholderData: (prev) => prev,
  });
}

export function useResponseStats() {
  return useQuery({
    queryKey: queryKeys.responses.stats(),
    queryFn: getResponseStats,
  });
}

export function useResponseFilterOptions() {
  return useQuery({
    queryKey: queryKeys.responses.filters(),
    queryFn: getResponseFilterOptions,
    staleTime: 120_000,
  });
}

export function useResponseDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.responses.detail(id ?? ""),
    queryFn: () => getResponse(id!),
    enabled: Boolean(id),
  });
}

export function useResponseMutations() {
  const exportResponsesMutation = useMutation({
    mutationFn: (params: Omit<ResponsesListParams, "page" | "limit">) =>
      exportResponses(params),
    onError: () => toast.error("Export failed"),
  });

  return { exportResponses: exportResponsesMutation };
}

export type { ResponsesListParams };
