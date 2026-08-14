/**
 * survey-lib.ts
 * Survey helpers — status, schedule, progress.
 * No API calls.
 */
import type { Agent as Survey, AgentConfig as SurveyConfig, AgentProgress as SurveyProgress, AgentSchedule as SurveySchedule, AgentSchedulingStatus as SurveySchedulingStatus } from "@/types/agent";

/* ========== readiness ========== */

export const DEFAULT_SURVEY_SCHEDULE: SurveySchedule = {
  enabled: false,
  startAt: null,
  endAt: null,
  timezone: "Asia/Kolkata",
  recurrence: "once",
  lastScheduledAt: null,
};

/** True when all enabled Create Survey steps have required data */
export function isSurveyReadyToSchedule(
  surveyOrConfig: Survey | SurveyConfig
): boolean {
  const config =
    "config" in surveyOrConfig ? surveyOrConfig.config : surveyOrConfig;
  const name =
    ("name" in surveyOrConfig && typeof surveyOrConfig.name === "string"
      ? surveyOrConfig.name
      : config.persona.name
    )?.trim() || config.persona.name.trim();
  const greeting = config.prompts.greeting?.trim() || "";
  const systemPrompt = config.prompts.systemPrompt?.trim() || "";
  const questions = config.surveyQuestions.questions ?? [];
  const contactUrl = config.clientContact.contactFileUrl?.trim() || "";
  const contactName = config.clientContact.contactFileName?.trim() || "";

  return Boolean(
    name &&
      (greeting || systemPrompt) &&
      questions.length > 0 &&
      (contactUrl || contactName)
  );
}

export function getSurveySchedule(survey: Survey): SurveySchedule {
  return survey.schedule ?? DEFAULT_SURVEY_SCHEDULE;
}

export function getSchedulingStatus(survey: Survey): SurveySchedulingStatus {
  return survey.scheduling_status ?? "draft";
}

/** Completed surveys are locked — no edit or delete */
export function isSurveyCompleted(survey: Survey): boolean {
  return getSchedulingStatus(survey) === "completed";
}

export function isSurveyScheduled(survey: Survey): boolean {
  const status = getSchedulingStatus(survey);
  return status === "scheduled" || status === "processing";
}

/** Badge / label — mirrors backend `scheduling_status` only */
export type SurveyDisplayStatus = SurveySchedulingStatus;

export function getSurveyDisplayStatus(survey: Survey): SurveyDisplayStatus {
  return getSchedulingStatus(survey);
}


/* ========== progress ========== */

export function computeSurveyProgress(
  config: SurveyConfig,
  schedule?: SurveySchedule | null
): SurveyProgress {
  const identityMissing: string[] = [];
  if (!config.persona.name.trim()) identityMissing.push("name");

  const promptsMissing: string[] = [];
  if (
    !config.prompts.greeting.trim() &&
    !config.prompts.systemPrompt.trim()
  ) {
    promptsMissing.push("greeting_or_systemPrompt");
  }

  const questionMissing: string[] = [];
  const questions = config.surveyQuestions.questions.filter((q) => {
    if (typeof q.question === "string" && q.question.trim()) return true;
    return Object.entries(q).some(([key, value]) => {
      if (["id", "_id", "type", "options", "__v"].includes(key)) return false;
      if (Array.isArray(value)) return value.length > 0;
      return typeof value === "string" && value.trim().length > 0;
    });
  });
  if (config.surveyQuestions.enabled !== false && questions.length === 0) {
    questionMissing.push("questions");
  }
  if (
    config.surveyQuestions.enabled !== false &&
    questions.some(
      (q) =>
        q.type === "multi" &&
        Array.isArray(q.options) &&
        (q.options?.filter((opt) => opt.label.trim() && opt.value.trim()).length ??
          0) < 2
    )
  ) {
    questionMissing.push("multi_question_options");
  }

  const contactMissing: string[] = [];
  if (
    !config.clientContact.contactFileUrl.trim() &&
    !config.clientContact.contactFileName.trim()
  ) {
    contactMissing.push("contact_file");
  }

  const currentSchedule = schedule ?? DEFAULT_SURVEY_SCHEDULE;
  const scheduleMissing: string[] = [];
  if (currentSchedule.enabled) {
    if (!currentSchedule.startAt) scheduleMissing.push("startAt");
    if (
      currentSchedule.endAt &&
      currentSchedule.startAt &&
      new Date(currentSchedule.endAt) <= new Date(currentSchedule.startAt)
    ) {
      scheduleMissing.push("endAt");
    }
  }

  const farewellMissing: string[] = [];
  if (!config.prompts.farewell?.trim()) {
    farewellMissing.push("farewell");
  }

  const identity = { complete: identityMissing.length === 0, missing: identityMissing };
  const prompts = { complete: promptsMissing.length === 0, missing: promptsMissing };
  const surveyQuestions = {
    complete: questionMissing.length === 0,
    missing: questionMissing,
  };
  const farewell = {
    complete: farewellMissing.length === 0,
    optional: true,
    missing: farewellMissing,
  };
  const clientContact = {
    complete: contactMissing.length === 0,
    missing: contactMissing,
  };
  const scheduleStep = {
    complete: currentSchedule.enabled ? scheduleMissing.length === 0 : false,
    optional: true,
    missing: scheduleMissing,
  };

  const completedRequiredSteps = [
    identity.complete,
    prompts.complete,
    surveyQuestions.complete,
    clientContact.complete,
  ].filter(Boolean).length;

  return {
    identity,
    prompts,
    "survey-questions": surveyQuestions,
    farewell,
    "client-contact": clientContact,
    schedule: scheduleStep,
    overallComplete: completedRequiredSteps === 4,
    completedRequiredSteps,
    totalRequiredSteps: 4,
  };
}

/** @deprecated use DEFAULT_SURVEY_SCHEDULE */
export const DEFAULT_AGENT_SCHEDULE = DEFAULT_SURVEY_SCHEDULE;

// Re-exports so existing `from "./survey-lib"` imports keep working
export type { SurveysExportFormat } from "./survey-export";
export {
  surveysToCSV,
  exportSurveysCSV,
  exportSurveysExcel,
  exportSurveys,
} from "./survey-export";
export {
  ALLOWED_QUESTION_TYPES,
  parseSurveyQuestionsFromText,
  parseSurveyQuestionsFromBuffer,
  parseSurveyQuestionsFromFile,
  validateSurveyQuestionRows,
  parseAndValidateSurveyQuestionsFile,
  SURVEY_QUESTIONS_SAMPLE_CSV,
  CLIENT_CONTACTS_SAMPLE_CSV,
  downloadSurveyQuestionsSample,
  downloadClientContactsSample,
} from "./survey-upload";
export type { AllowedQuestionType, QuestionValidationResult } from "./survey-upload";
