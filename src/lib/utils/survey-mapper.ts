/**
 * Maps between the backend Survey model and the frontend Agent type.
 *
 * Backend shape (Mongoose):
 *   _id, name, scheduling_status, conversationCount,
 *   persona { language, maxCallDurationMinutes, audioCacheEnabled, livekitInferenceEnabled, stt, llm, tts },
 *   prompts { greeting, greetsFirst, systemPrompt, farewell },
 *   surveyQuestions { enabled, questions[] },
 *   clientContact { contactFileUrl, contactFileName, contacts[] },
 *   schedule { enabled, startAt, endAt, timezone, recurrence, status, lastScheduledAt },
 *   createdAt, updatedAt
 *
 * Frontend shape: Agent (types/agent.ts)
 */

import { DEFAULT_AGENT_CONFIG, DEFAULT_FAREWELL } from "@/lib/constants/agent-config";
import type {
  Agent,
  AgentConfig,
  AgentProgress,
  AgentSchedule,
  AgentScheduleRecurrence,
  AgentScheduleStatus,
  AgentSchedulingStatus,
} from "@/types/agent";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BackendSurvey = Record<string, any>;

const DEFAULT_PROGRESS: AgentProgress = {
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

function mapSchedulingStatus(s: BackendSurvey): AgentSchedulingStatus {
  const raw = s.scheduling_status ?? s.status;
  if (
    raw === "draft" ||
    raw === "scheduled" ||
    raw === "completed" ||
    raw === "processing"
  ) {
    return raw;
  }
  // Legacy status: active/paused → treat as draft unless schedule says otherwise
  if (s.schedule?.enabled && s.schedule?.status === "scheduled") {
    return "scheduled";
  }
  if (s.schedule?.status === "completed") return "completed";
  return "draft";
}

export function backendSurveyToAgent(s: BackendSurvey): Agent {
  const id = s._id ?? s.id;
  const persona = s.persona ?? {};
  const prompts = s.prompts ?? {};
  const sq = s.surveyQuestions ?? {};
  const cc = s.clientContact ?? {};
  const sch = s.schedule ?? {};
  const progress = s.progress ?? {};

  const config: AgentConfig = {
    persona: {
      ...DEFAULT_AGENT_CONFIG.persona,
      name: s.name ?? "",
      language: persona.language ?? "en",
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
        voice: persona.tts?.voice ?? "Aakash",
      },
    },
    prompts: {
      greeting: prompts.greeting ?? "",
      greetsFirst: prompts.greetsFirst ?? true,
      systemPrompt: prompts.systemPrompt ?? "",
      farewell: prompts.farewell?.trim() ? prompts.farewell : DEFAULT_FAREWELL,
    },
    surveyQuestions: {
      enabled: sq.enabled ?? true,
      questionsFileUrl: sq.questionsFileUrl ?? "",
      questionsFileName: sq.questionsFileName ?? "",
      questions: (sq.questions ?? []).map(
        // Preserve every column from uploaded / manual rows
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q: any) => ({ ...q })
      ),
    },
    clientContact: {
      contactFileUrl: cc.contactFileUrl ?? "",
      contactFileName: cc.contactFileName ?? "",
      contacts: (cc.contacts ?? [])
        .filter((row: unknown) => row && typeof row === "object")
        // Preserve every column from uploaded rows
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((row: any) => ({ ...row })),
    },
    functions: DEFAULT_AGENT_CONFIG.functions,
    wisdom: DEFAULT_AGENT_CONFIG.wisdom,
    postCall: DEFAULT_AGENT_CONFIG.postCall,
  };

  const schedule: AgentSchedule = {
    enabled: sch.enabled ?? false,
    startAt: sch.startAt ?? null,
    endAt: sch.endAt ?? null,
    timezone: sch.timezone ?? "Asia/Kolkata",
    recurrence: (sch.recurrence ?? "once") as AgentScheduleRecurrence,
    status: (sch.status ?? "idle") as AgentScheduleStatus,
    lastScheduledAt: sch.lastScheduledAt ?? null,
  };

  const mappedProgress: AgentProgress = {
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
    language: persona.language ?? "en",
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

/**
 * Convert the frontend AgentConfig + metadata into a backend-compatible
 * payload for POST /surveys (create or update).
 * scheduling_status is owned by the backend (draft / scheduled on schedule).
 */
export function agentToBackendPayload(
  agent: {
    id?: string;
    config: AgentConfig;
    step?: number;
  },
  schedule?: {
    enabled?: boolean;
    startAt?: string;
    endAt?: string | null;
    timezone?: string;
    recurrence?: string;
  } | null
) {
  const c = agent.config;

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

  if (agent.id) {
    payload.id = agent.id;
  }

  if (agent.step) {
    payload.step = agent.step;
  }

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
