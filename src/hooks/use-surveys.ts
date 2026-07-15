"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import { surveysModuleService } from "@/services/surveys-module.service";
import type { CreateSurveyPayload, SaveSurveyPayload } from "@/types/survey";

export function useSurveys(activeOnly = true, search = "") {
  return useQuery({
    queryKey: queryKeys.surveys.list({ active: activeOnly, search }),
    queryFn: () => surveysModuleService.list(activeOnly, search),
    staleTime: 60_000,
  });
}

export function useSurveyDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.surveys.detail(id ?? ""),
    queryFn: () => surveysModuleService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useSurveyMutations() {
  const queryClient = useQueryClient();

  const invalidate = (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ["surveys"] });
    if (id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.detail(id) });
    }
  };

  const createSurvey = useMutation({
    mutationFn: (payload: CreateSurveyPayload) =>
      surveysModuleService.create(payload),
    onSuccess: () => {
      toast.success("Survey created");
      invalidate();
    },
    onError: () => toast.error("Failed to create survey"),
  });

  const saveSurvey = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveSurveyPayload }) =>
      surveysModuleService.save(id, payload),
    onSuccess: (_, { id }) => {
      toast.success("Survey saved");
      invalidate(id);
    },
    onError: () => toast.error("Failed to save survey"),
  });

  const togglePublish = useMutation({
    mutationFn: ({
      id,
      published,
    }: {
      id: string;
      published: boolean;
    }) => surveysModuleService.togglePublish(id, published),
    onSuccess: (data, { id }) => {
      toast.success(data.status === "active" ? "Survey published" : "Survey unpublished");
      invalidate(id);
    },
    onError: () => toast.error("Failed to update publish status"),
  });

  const deleteSurvey = useMutation({
    mutationFn: (id: string) => surveysModuleService.delete(id),
    onSuccess: () => {
      toast.success("Survey deleted");
      invalidate();
    },
    onError: () => toast.error("Failed to delete survey"),
  });

  return { createSurvey, saveSurvey, togglePublish, deleteSurvey };
}
