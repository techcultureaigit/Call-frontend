"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  campaignTemplatesService,
  type TemplatesListParams,
} from "@/services/campaign-templates.service";
import type { CreateTemplatePayload } from "@/types/campaign-template";

export function useCampaignTemplates(params: TemplatesListParams) {
  return useQuery({
    queryKey: queryKeys.campaignTemplates.list(
      params as Record<string, unknown>
    ),
    queryFn: () => campaignTemplatesService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useCampaignTemplateStats() {
  return useQuery({
    queryKey: queryKeys.campaignTemplates.stats(),
    queryFn: () => campaignTemplatesService.getStats(),
  });
}

export function useCampaignTemplateDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.campaignTemplates.detail(id ?? ""),
    queryFn: () => campaignTemplatesService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCampaignTemplateMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["campaignTemplates"] });

  const createTemplate = useMutation({
    mutationFn: (payload: CreateTemplatePayload) =>
      campaignTemplatesService.create(payload),
    onSuccess: () => {
      toast.success("Template saved");
      invalidate();
    },
    onError: () => toast.error("Failed to save template"),
  });

  const duplicateTemplate = useMutation({
    mutationFn: (id: string) => campaignTemplatesService.duplicate(id),
    onSuccess: () => {
      toast.success("Template duplicated");
      invalidate();
    },
    onError: () => toast.error("Failed to duplicate"),
  });

  const archiveTemplate = useMutation({
    mutationFn: (id: string) => campaignTemplatesService.archive(id),
    onSuccess: () => {
      toast.success("Template archived");
      invalidate();
    },
    onError: () => toast.error("Failed to archive"),
  });

  const updateTemplate = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateTemplatePayload;
    }) => campaignTemplatesService.update(id, payload),
    onSuccess: () => {
      toast.success("Template updated");
      invalidate();
    },
    onError: () => toast.error("Failed to update template"),
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => campaignTemplatesService.delete(id),
    onSuccess: () => {
      toast.success("Template deleted");
      invalidate();
    },
    onError: () => toast.error("Failed to delete"),
  });

  return {
    createTemplate,
    updateTemplate,
    duplicateTemplate,
    archiveTemplate,
    deleteTemplate,
  };
}
