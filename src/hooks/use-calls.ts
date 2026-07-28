"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  callsModuleService,
  type CallsListParams,
} from "@/services/calls-module.service";

export function useCalls(params: CallsListParams) {
  return useQuery({
    queryKey: queryKeys.calls.module(params as Record<string, unknown>),
    queryFn: () => callsModuleService.list(params),
    placeholderData: (prev) => prev,
    refetchInterval: params.liveOnly ? 5000 : false,
  });
}

export function useCallStats() {
  return useQuery({
    queryKey: queryKeys.calls.stats(),
    queryFn: () => callsModuleService.getStats(),
    refetchInterval: 10000,
  });
}

export function useCallDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.calls.detail(id ?? ""),
    queryFn: () => callsModuleService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCallMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["calls"] });

  const retryCall = useMutation({
    mutationFn: (id: string) => callsModuleService.retry(id),
    onSuccess: () => {
      toast.success("Call queued for retry");
      invalidate();
    },
    onError: () => toast.error("Cannot retry this call"),
  });

  return { retryCall };
}
