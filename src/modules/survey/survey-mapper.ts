/**
 * survey-mapper.ts
 * Maps backend survey JSON to frontend Agent shape.
 * Used internally by api.ts — not called from UI files directly.
 */
import { DEFAULT_AGENT_CONFIG as DEFAULT_SURVEY_CONFIG } from "@/lib/constants/agent-config";
import type {
  Agent as Survey,
  AgentConfig as SurveyConfig,
  AgentProgress as SurveyProgress,
  AgentSchedule as SurveySchedule,
  AgentScheduleRecurrence as SurveyScheduleRecurrence,
  AgentScheduleStatus as SurveyScheduleStatus,
  AgentSchedulingStatus as SurveySchedulingStatus,
} from "@/types/agent";

import type { SaveSurveyInput } from "./survey-types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BackendSurvey = Record<string, any>;

const DEFAULT_PROGRESS: SurveyProgress = {
  identity: { complete: false, missing: ["name"] },
  prompts: { complete: false, missing: ["greeting_or_systemPrompt"] },
  "survey-questions": { complete: false, missing: ["questions"] },
  farewell: { complete: false, optional: true, missing: ["farewell"] },
  "client-contact": { complete: false, missing: ["contact_file"] },
  schedule: { complete: false, optional: true, missing: [] },
  overallComplete: false,
  completedRequiredSteps: 0,
  totalRequiredSteps: 4,
};

function mapSchedulingStatus(s: BackendSurvey): SurveySchedulingStatus {
  const raw = s.scheduling_status ?? s.status;
  if (
    raw === "draft" ||
    raw === "scheduled" ||
    raw === "completed" ||
    raw === "processing"
  ) {
    return raw;
  }
  if (s.schedule?.enabled && s.schedule?.status === "scheduled") return "scheduled";
  if (s.schedule?.status === "completed") return "completed";
  return "draft";
}

export function backendSurveyToAgent(s: BackendSurvey): Survey {
  const id = s._id ?? s.id;
  const persona = s.persona ?? {};
  const prompts = s.prompts ?? {};
  const sq = s.surveyQuestions ?? {};
  const cc = s.clientContact ?? {};
  const sch = s.schedule ?? {};
  const progress = s.progress ?? {};

  const config: SurveyConfig = {
    persona: {
      ...DEFAULT_SURVEY_CONFIG.persona,
      name: s.name ?? "",
      language: persona.language ?? "hi",
      maxCallDurationMinutes: persona.maxCallDurationMinutes ?? 15,
      audioCacheEnabled: persona.audioCacheEnabled ?? false,
      livekitInferenceEnabled: persona.livekitInferenceEnabled ?? false,
      stt: {
        provider: persona.stt?.provider ?? "sarvam",
        model: persona.stt?.model ?? "Saaras:v3",
      },
      llm: {
        provider: persona.llm?.provider ?? "openai",
        model: persona.llm?.model ?? "gpt-4o",
      },
      tts: {
        provider: persona.tts?.provider ?? "google",
        model: persona.tts?.model ?? "Google",
        voice: persona.tts?.voice ?? "",
      },
    },
    prompts: {
      greeting: prompts.greeting ?? "",
      greetsFirst: prompts.greetsFirst ?? true,
      systemPrompt: prompts.systemPrompt ?? "",
      farewell: prompts.farewell ?? "",
    },
    surveyQuestions: {
      enabled: sq.enabled ?? true,
      questionsFileUrl: sq.questionsFileUrl ?? "",
      questionsFileName: sq.questionsFileName ?? "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questions: (sq.questions ?? []).map((q: any) => ({ ...q })),
    },
    clientContact: {
      contactFileUrl: cc.contactFileUrl ?? "",
      contactFileName: cc.contactFileName ?? "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contacts: (cc.contacts ?? [])
        .filter((row: unknown) => row && typeof row === "object")
        .map((row: any) => ({ ...row })),
    },
    functions: DEFAULT_SURVEY_CONFIG.functions,
    wisdom: DEFAULT_SURVEY_CONFIG.wisdom,
    postCall: DEFAULT_SURVEY_CONFIG.postCall,
  };

  const schedule: SurveySchedule = {
    enabled: sch.enabled ?? false,
    startAt: sch.startAt ?? null,
    endAt: sch.endAt ?? null,
    timezone: sch.timezone ?? "Asia/Kolkata",
    recurrence: (sch.recurrence ?? "once") as SurveyScheduleRecurrence,
    status: (sch.status ?? "idle") as SurveyScheduleStatus,
    lastScheduledAt: sch.lastScheduledAt ?? null,
  };

  const mappedProgress: SurveyProgress = {
    identity: progress.identity ?? DEFAULT_PROGRESS.identity,
    prompts: progress.prompts ?? DEFAULT_PROGRESS.prompts,
    "survey-questions":
      progress.surveyQuestions ?? DEFAULT_PROGRESS["survey-questions"],
    farewell: progress.farewell ?? DEFAULT_PROGRESS.farewell,
    "client-contact":
      progress.clientContact ?? DEFAULT_PROGRESS["client-contact"],
    schedule: progress.schedule ?? DEFAULT_PROGRESS.schedule,
    overallComplete: progress.overallComplete ?? false,
    completedRequiredSteps: progress.completedRequiredSteps ?? 0,
    totalRequiredSteps: progress.totalRequiredSteps ?? 4,
  };

  return {
    id,
    name: s.name ?? "",
    scheduling_status: mapSchedulingStatus(s),
    language: persona.language ?? "hi",
    modelMode: "pipeline",
    phone: null,
    conversationCount: s.conversationCount ?? 0,
    config,
    schedule,
    progress: mappedProgress,
    createdAt: s.createdAt ?? new Date().toISOString(),
    updatedAt: s.updatedAt ?? new Date().toISOString(),
  };
}

export function agentToBackendPayload(
  survey: SaveSurveyInput,
  schedule?: {
    enabled?: boolean;
    startAt?: string;
    endAt?: string | null;
    timezone?: string;
    recurrence?: string;
  } | null
) {
  const c = survey.config;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: Record<string, any> = {
    name: c.persona.name.trim() || "Untitled Survey",
    persona: {
      language: c.persona.language,
      maxCallDurationMinutes: c.persona.maxCallDurationMinutes,
      audioCacheEnabled: c.persona.audioCacheEnabled,
      livekitInferenceEnabled: c.persona.livekitInferenceEnabled,
      stt: { provider: c.persona.stt.provider, model: c.persona.stt.model },
      llm: { provider: c.persona.llm.provider, model: c.persona.llm.model },
      tts: {
        provider: c.persona.tts.provider,
        model: c.persona.tts.model,
        voice: c.persona.tts.voice,
      },
    },
    prompts: {
      greeting: c.prompts.greeting,
      greetsFirst: c.prompts.greetsFirst,
      systemPrompt: c.prompts.systemPrompt,
      farewell: c.prompts.farewell ?? "",
    },
    surveyQuestions: {
      enabled: c.surveyQuestions.enabled,
      questionsFileUrl: c.surveyQuestions.questionsFileUrl ?? "",
      questionsFileName: c.surveyQuestions.questionsFileName ?? "",
      questions: c.surveyQuestions.questions.map((q) => ({ ...q })),
    },
    clientContact: {
      contactFileUrl: c.clientContact.contactFileUrl,
      contactFileName: c.clientContact.contactFileName,
      contacts: (c.clientContact.contacts ?? []).map((row) => ({ ...row })),
    },
  };
  if (survey.id) payload.id = survey.id;
  if (survey.step) payload.step = survey.step;
  if (schedule) {
    payload.schedule = {
      enabled: schedule.enabled ?? true,
      startAt: schedule.startAt ?? null,
      endAt: schedule.endAt ?? null,
      timezone: schedule.timezone ?? "Asia/Kolkata",
      recurrence: schedule.recurrence ?? "once",
    };
  }
  return payload;
}
