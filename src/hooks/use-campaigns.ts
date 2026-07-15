"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  campaignsModuleService,
  type CampaignsListParams,
} from "@/services/campaigns-module.service";
import type { CreateCampaignPayload } from "@/types/campaign";

export function useCampaigns(params: CampaignsListParams) {
  return useQuery({
    queryKey: queryKeys.campaigns.module(params as Record<string, unknown>),
    queryFn: () => campaignsModuleService.list(params),
    placeholderData: (prev) => prev,
    refetchInterval: params.live ? 5000 : false,
  });
}

export function useCampaignAggregateStats() {
  return useQuery({
    queryKey: queryKeys.campaigns.aggregate(),
    queryFn: () => campaignsModuleService.getAggregateStats(),
    refetchInterval: 5000,
  });
}

export function useCampaignStats(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.campaigns.stats(id),
    queryFn: () => campaignsModuleService.getStats(id),
    enabled: enabled && Boolean(id),
    refetchInterval: 3000,
  });
}

export function useCampaignMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  };

  const createCampaign = useMutation({
    mutationFn: (payload: CreateCampaignPayload) =>
      campaignsModuleService.create(payload),
    onSuccess: () => {
      toast.success("Campaign created successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to create campaign"),
  });

  const pauseCampaign = useMutation({
    mutationFn: (id: string) => campaignsModuleService.action(id, "pause"),
    onSuccess: () => {
      toast.success("Campaign paused");
      invalidate();
    },
    onError: () => toast.error("Cannot pause this campaign"),
  });

  const resumeCampaign = useMutation({
    mutationFn: (id: string) => campaignsModuleService.action(id, "resume"),
    onSuccess: () => {
      toast.success("Campaign resumed");
      invalidate();
    },
    onError: () => toast.error("Cannot resume this campaign"),
  });

  const stopCampaign = useMutation({
    mutationFn: (id: string) => campaignsModuleService.action(id, "stop"),
    onSuccess: () => {
      toast.success("Campaign stopped");
      invalidate();
    },
    onError: () => toast.error("Cannot stop this campaign"),
  });

  const launchCampaign = useMutation({
    mutationFn: (id: string) => campaignsModuleService.action(id, "launch"),
    onSuccess: () => {
      toast.success("Campaign launched");
      invalidate();
    },
    onError: () => toast.error("Cannot launch this campaign"),
  });

  const retryFailedCalls = useMutation({
    mutationFn: (id: string) =>
      campaignsModuleService.action(id, "retry_failed"),
    onSuccess: () => {
      toast.success("Retrying failed calls");
      invalidate();
    },
    onError: () => toast.error("No failed calls to retry"),
  });

  const deleteCampaign = useMutation({
    mutationFn: (id: string) => campaignsModuleService.delete(id),
    onSuccess: () => {
      toast.success("Campaign deleted");
      invalidate();
    },
    onError: () => toast.error("Failed to delete campaign"),
  });

  return {
    createCampaign,
    pauseCampaign,
    resumeCampaign,
    stopCampaign,
    launchCampaign,
    retryFailedCalls,
    deleteCampaign,
  };
}
