import type { AgentConfig, AgentProgress, AgentSchedule } from "@/types/agent";

const EMPTY_SCHEDULE: AgentSchedule = {
  enabled: false,
  startAt: null,
  endAt: null,
  timezone: "Asia/Kolkata",
  recurrence: "once",
  status: "idle",
  lastScheduledAt: null,
};

export function computeSurveyProgress(
  config: AgentConfig,
  schedule?: AgentSchedule | null
): AgentProgress {
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

  const currentSchedule = schedule ?? EMPTY_SCHEDULE;
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

  const identity = { complete: identityMissing.length === 0, missing: identityMissing };
  const prompts = { complete: promptsMissing.length === 0, missing: promptsMissing };
  const surveyQuestions = {
    complete: questionMissing.length === 0,
    missing: questionMissing,
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
    "client-contact": clientContact,
    schedule: scheduleStep,
    overallComplete: completedRequiredSteps === 4,
    completedRequiredSteps,
    totalRequiredSteps: 4,
  };
}
