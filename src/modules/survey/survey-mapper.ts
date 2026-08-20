/**
 * survey-mapper.ts
 * Maps backend survey JSON to frontend Agent shape.
 * Used internally by api.ts — not called from UI files directly.
 */
import {
  DEFAULT_AGENT_CONFIG as DEFAULT_SURVEY_CONFIG,
  normalizeVoiceSpeed,
} from "@/lib/constants/agent-config";
import type {
  Agent as Survey,
  AgentConfig as SurveyConfig,
  AgentProgress as SurveyProgress,
  AgentSchedule as SurveySchedule,
  AgentScheduleRecurrence as SurveyScheduleRecurrence,
  AgentSchedulingStatus as SurveySchedulingStatus,
} from "@/types/agent";

import type { SaveSurveyInput } from "./survey-types";
import { DEFAULT_SURVEY_SCHEDULE } from "./survey-lib";

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

function clampNoiseVolume(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return DEFAULT_SURVEY_CONFIG.persona.volume;
  return Math.min(1, Math.max(0, num));
}

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
  return "draft";
}

/** Survey stores modelId; GET returns populated { id, name, provider } */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStack(stack: any = {}) {
  const rawModel = stack?.modelId;
  let modelId: string | undefined;
  let providerId: string | undefined;
  let provider = stack?.provider ?? "";
  let model = stack?.model ?? "";

  if (rawModel && typeof rawModel === "object") {
    modelId = String(rawModel._id ?? rawModel.id ?? "");
    model = String(rawModel.name || model);

    // Nested provider: modelId.provider OR modelId.provider_id
    const pref = rawModel.provider ?? rawModel.provider_id;
    if (pref && typeof pref === "object") {
      providerId = String(pref._id ?? pref.id ?? "");
      provider = String(pref.name || provider);
    } else if (pref) {
      providerId = String(pref);
    }
  } else if (rawModel) {
    modelId = String(rawModel);
  }

  // Legacy flat fields (older API responses)
  if (!providerId && stack?.providerId) {
    const raw = stack.providerId;
    providerId =
      raw && typeof raw === "object"
        ? String(raw._id ?? raw.id ?? "")
        : String(raw);
    if (raw && typeof raw === "object" && raw.name) provider = String(raw.name);
  }

  return {
    modelId: modelId || undefined,
    providerId: providerId || undefined,
    provider,
    model: model || "",
  };
}

export function backendSurveyToAgent(s: BackendSurvey): Survey {
  const id = s._id ?? s.id;
  const persona = s.persona ?? {};
  const prompts = s.prompts ?? {};
  const sq = s.surveyQuestions ?? {};
  const cc = s.clientContact ?? {};
  const sch = s.schedule ?? {};
  const progress = s.progress ?? {};
  const rawVoice = persona.tts?.voice;
  const voiceId =
    rawVoice && typeof rawVoice === "object"
      ? String(rawVoice._id ?? rawVoice.id ?? "")
      : String(rawVoice ?? "");
  const voiceName =
    rawVoice && typeof rawVoice === "object"
      ? String(rawVoice.name ?? "")
      : String(rawVoice ?? "");
  const voicePreviewUrl =
    rawVoice && typeof rawVoice === "object"
      ? String(rawVoice.previewUrl ?? "")
      : "";

  const config: SurveyConfig = {
    persona: {
      ...DEFAULT_SURVEY_CONFIG.persona,
      name: s.name ?? "",
      language: persona.language ?? "hi",
      maxCallDurationMinutes: persona.maxCallDurationMinutes ?? 15,
      audioCacheEnabled: persona.audioCacheEnabled ?? false,
      livekitInferenceEnabled: persona.livekitInferenceEnabled ?? false,
      stt: mapStack(persona.stt),
      llm: mapStack(persona.llm),
      tts: {
        ...mapStack(persona.tts),
        voice: voiceId,
        voiceName,
        voicePreviewUrl,
        tts_speed: normalizeVoiceSpeed(
          persona.tts?.tts_speed ?? persona.tts?.speed
        ),
      },
      noise_type: persona.noise_type || DEFAULT_SURVEY_CONFIG.persona.noise_type,
      volume: clampNoiseVolume(persona.volume),
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

  const scheduling_status = mapSchedulingStatus(s);
  const schedule: SurveySchedule =
    scheduling_status === "draft"
      ? { ...DEFAULT_SURVEY_SCHEDULE }
      : {
          enabled: sch.enabled ?? false,
          startAt: sch.startAt ?? null,
          endAt: sch.endAt ?? null,
          timezone: sch.timezone ?? "Asia/Kolkata",
          recurrence: (sch.recurrence ?? "once") as SurveyScheduleRecurrence,
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
    scheduling_status,
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
      stt: {
        modelId: c.persona.stt.modelId || null,
      },
      llm: {
        modelId: c.persona.llm.modelId || null,
      },
      tts: {
        modelId: c.persona.tts.modelId || null,
        voice: c.persona.tts.voice || null,
        // Speed belongs to the voice — nothing is stored without one
        tts_speed: c.persona.tts.voice
          ? normalizeVoiceSpeed(c.persona.tts.tts_speed)
          : null,
      },
      noise_type: c.persona.noise_type || DEFAULT_SURVEY_CONFIG.persona.noise_type,
      volume: clampNoiseVolume(c.persona.volume),
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
      questions: c.surveyQuestions.questions.map((q) => {
        const conditions = Array.isArray(q.conditions)
          ? q.conditions
              .map((row) => {
                const ifAnswer =
                  typeof row?.ifAnswer === "string" ? row.ifAnswer.trim() : "";
                if (!ifAnswer) return null;

                let thenShowQuestions = Array.isArray(row.thenShowQuestions)
                  ? row.thenShowQuestions
                  : [];

                // Migrate legacy single follow-up (older saved surveys)
                const legacyRow = row as typeof row & {
                  thenShowQuestion?: string;
                  thenShowType?: string;
                  thenShowInstruction?: string;
                  thenShowOptions?: {
                    id?: string;
                    label?: string;
                    value?: string;
                  }[];
                };
                if (
                  thenShowQuestions.length === 0 &&
                  typeof legacyRow.thenShowQuestion === "string" &&
                  legacyRow.thenShowQuestion.trim()
                ) {
                  const thenShowType =
                    String(legacyRow.thenShowType || "text").trim() || "text";
                  const legacy: {
                    type: string;
                    question: string;
                    instruction: string;
                    options?: { id: string; label: string; value: string }[];
                  } = {
                    type: thenShowType,
                    question: legacyRow.thenShowQuestion.trim(),
                    instruction: String(
                      legacyRow.thenShowInstruction || ""
                    ).trim(),
                  };
                  if (
                    thenShowType === "multi" &&
                    Array.isArray(legacyRow.thenShowOptions)
                  ) {
                    legacy.options = legacyRow.thenShowOptions
                      .map((opt) => ({
                        id: String(opt.id || ""),
                        label: String(opt.label || "").trim(),
                        value: String(opt.value || "").trim(),
                      }))
                      .filter((opt) => opt.label);
                  }
                  thenShowQuestions = [legacy];
                }

                const cleaned = thenShowQuestions
                  .map((item) => {
                    const question = String(item?.question || "").trim();
                    if (!question) return null;
                    const type = String(item?.type || "text").trim() || "text";
                    const instruction = String(item?.instruction || "").trim();
                    const next: {
                      type: string;
                      question: string;
                      instruction: string;
                      options?: { id: string; label: string; value: string }[];
                    } = { type, question, instruction };
                    if (type === "multi" && Array.isArray(item?.options)) {
                      next.options = item.options
                        .map((opt) => ({
                          id: String(opt.id || ""),
                          label: String(opt.label || "").trim(),
                          value: String(opt.value || "").trim(),
                        }))
                        .filter((opt) => opt.label);
                    }
                    return next;
                  })
                  .filter((item): item is NonNullable<typeof item> => item !== null);

                if (cleaned.length === 0) return null;
                return { ifAnswer, thenShowQuestions: cleaned };
              })
              .filter((row): row is NonNullable<typeof row> => row !== null)
          : [];
        const next = { ...q };
        if (conditions.length) next.conditions = conditions;
        else delete next.conditions;
        return next;
      }),
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
