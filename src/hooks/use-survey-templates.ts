"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  surveyTemplatesModuleService,
  type SurveyTemplatesListParams,
} from "@/services/survey-templates-module.service";

export function useSurveyTemplates(params: SurveyTemplatesListParams = {}) {
  return useQuery({
    queryKey: queryKeys.surveyTemplates.list(
      params as Record<string, unknown>
    ),
    queryFn: () => surveyTemplatesModuleService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useSurveyTemplateDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.surveyTemplates.detail(id ?? ""),
    queryFn: () => surveyTemplatesModuleService.getById(id!),
    enabled: Boolean(id),
  });
}
