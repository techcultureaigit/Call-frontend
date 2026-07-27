"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import { responsesApi, type ResponsesListParams } from "@/api";

export function useResponses(params: ResponsesListParams) {
  return useQuery({
    queryKey: queryKeys.responses.module(params as Record<string, unknown>),
    queryFn: () => responsesApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useResponseStats() {
  return useQuery({
    queryKey: queryKeys.responses.stats(),
    queryFn: () => responsesApi.getStats(),
  });
}

export function useResponseFilterOptions() {
  return useQuery({
    queryKey: queryKeys.responses.filters(),
    queryFn: () => responsesApi.getFilterOptions(),
    staleTime: 120_000,
  });
}

export function useResponseDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.responses.detail(id ?? ""),
    queryFn: () => responsesApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useResponseMutations() {
  const exportResponses = useMutation({
    mutationFn: (params: Omit<ResponsesListParams, "page" | "limit">) =>
      responsesApi.export(params),
    onError: () => toast.error("Export failed"),
  });

  return { exportResponses };
}
