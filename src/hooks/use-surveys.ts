"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DEFAULT_AGENT_CONFIG } from "@/lib/constants/agent-config";
import { queryKeys } from "@/lib/constants/query-keys";
import { generateAgentUuid } from "@/lib/data/mock-agents";
import { surveysModuleService } from "@/services/surveys-module.service";
import type { Agent, AgentSurveyQuestion } from "@/types/agent";
import type { QuestionType, SurveyQuestion } from "@/types/survey";

function agentTypeToBuilderType(type: string): QuestionType {
  if (type === "multi" || type === "multiple_choice") return "multiple_choice";
  if (type === "yes_no") return "yes_no";
  if (type === "rating") return "rating";
  if (type === "number") return "number";
  if (type === "checkbox") return "checkbox";
  if (type === "dropdown") return "dropdown";
  return "text";
}

function builderTypeToAgentType(type: QuestionType): string {
  if (type === "multiple_choice" || type === "checkbox" || type === "dropdown") {
    return "multi";
  }
  return type;
}

export function agentQuestionsToBuilder(
  questions: AgentSurveyQuestion[]
): SurveyQuestion[] {
  return questions.map((q, index) => ({
    id: q.id,
    type: agentTypeToBuilderType(typeof q.type === "string" ? q.type : "text"),
    title:
      (typeof q.question === "string" && q.question) ||
      Object.entries(q)
        .filter(
          ([k, v]) =>
            !["id", "_id", "type", "options", "__v"].includes(k) &&
            typeof v === "string" &&
            v.trim()
        )
        .map(([, v]) => String(v))[0] ||
      "Untitled",
    required: false,
    options: Array.isArray(q.options)
      ? q.options.map((o) => o.label)
      : undefined,
    order: index,
  }));
}

export function builderQuestionsToAgent(
  questions: SurveyQuestion[]
): AgentSurveyQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    type: builderTypeToAgentType(q.type),
    question: q.title,
    options: q.options?.map((label, i) => ({
      id: `opt-${q.id}-${i}`,
      label,
      value: label.toLowerCase().replace(/\s+/g, "_"),
    })),
  }));
}

export function useSurveys(activeOnly = true, search = "") {
  return useQuery({
    queryKey: queryKeys.surveys.list({ active: activeOnly, search }),
    queryFn: async () => {
      const result = await surveysModuleService.list({
        page: 1,
        limit: 100,
        search: search || undefined,
        status: activeOnly ? "active" : undefined,
      });
      return result.data;
    },
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

export interface BuilderSavePayload {
  name: string;
  description?: string;
  questions: SurveyQuestion[];
  status?: Agent["status"];
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
    mutationFn: async (payload: { name: string; description?: string }) => {
      const config = {
        ...DEFAULT_AGENT_CONFIG,
        persona: {
          ...DEFAULT_AGENT_CONFIG.persona,
          name: payload.name.trim() || "Untitled Survey",
        },
      };
      return surveysModuleService.save({
        uuid: generateAgentUuid(),
        config,
        status: "draft",
      });
    },
    onSuccess: () => {
      toast.success("Survey created");
      invalidate();
    },
    onError: () => toast.error("Failed to create survey"),
  });

  const saveSurvey = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: BuilderSavePayload;
    }) => {
      const existing = await surveysModuleService.getById(id);
      const config = {
        ...existing.config,
        persona: {
          ...existing.config.persona,
          name: payload.name.trim() || existing.name,
        },
        surveyQuestions: {
          ...existing.config.surveyQuestions,
          enabled: true,
          questionsFileUrl: "",
          questionsFileName: "",
          questions: builderQuestionsToAgent(payload.questions),
        },
      };
      return surveysModuleService.save({
        id,
        uuid: existing.uuid,
        config,
        status: payload.status ?? existing.status,
      });
    },
    onSuccess: (_, { id }) => {
      toast.success("Survey saved");
      invalidate(id);
    },
    onError: () => toast.error("Failed to save survey"),
  });

  const togglePublish = useMutation({
    mutationFn: async ({
      id,
      published,
    }: {
      id: string;
      published: boolean;
    }) => {
      const existing = await surveysModuleService.getById(id);
      return surveysModuleService.save({
        id,
        uuid: existing.uuid,
        config: existing.config,
        status: published ? "active" : "draft",
      });
    },
    onSuccess: (data, { id }) => {
      toast.success(
        data.status === "active" ? "Survey published" : "Survey unpublished"
      );
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
