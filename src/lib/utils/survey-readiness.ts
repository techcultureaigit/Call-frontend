import type { Agent, AgentConfig, AgentSchedule } from "@/types/agent";

export const DEFAULT_AGENT_SCHEDULE: AgentSchedule = {
  enabled: false,
  startAt: null,
  endAt: null,
  timezone: "Asia/Kolkata",
  recurrence: "once",
  status: "idle",
  lastScheduledAt: null,
};

/** True when all enabled Create Survey steps have required data */
export function isSurveyReadyToSchedule(
  agentOrConfig: Agent | AgentConfig
): boolean {
  const config =
    "config" in agentOrConfig ? agentOrConfig.config : agentOrConfig;
  const name =
    ("name" in agentOrConfig && typeof agentOrConfig.name === "string"
      ? agentOrConfig.name
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

export function getSurveySchedule(agent: Agent): AgentSchedule {
  return agent.schedule ?? DEFAULT_AGENT_SCHEDULE;
}

export function isSurveyScheduled(agent: Agent): boolean {
  const schedule = getSurveySchedule(agent);
  return Boolean(schedule.enabled && schedule.status === "scheduled");
}
