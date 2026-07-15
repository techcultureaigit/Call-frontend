"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  responsesModuleService,
  type ResponsesListParams,
} from "@/services/responses-module.service";

export function useResponses(params: ResponsesListParams) {
  return useQuery({
    queryKey: queryKeys.responses.module(params as Record<string, unknown>),
    queryFn: () => responsesModuleService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useResponseStats() {
  return useQuery({
    queryKey: queryKeys.responses.stats(),
    queryFn: () => responsesModuleService.getStats(),
  });
}

export function useResponseFilterOptions() {
  return useQuery({
    queryKey: queryKeys.responses.filters(),
    queryFn: () => responsesModuleService.getFilterOptions(),
    staleTime: 120_000,
  });
}

export function useResponseDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.responses.detail(id ?? ""),
    queryFn: () => responsesModuleService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useResponseMutations() {
  const exportResponses = useMutation({
    mutationFn: (params: Omit<ResponsesListParams, "page" | "limit">) =>
      responsesModuleService.export(params),
    onError: () => toast.error("Export failed"),
  });

  return { exportResponses };
}
