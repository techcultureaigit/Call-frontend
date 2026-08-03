import type {
  Agent,
  AgentConfig,
  AgentSchedule,
  AgentSchedulingStatus,
} from "@/types/agent";

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

export function getSchedulingStatus(agent: Agent): AgentSchedulingStatus {
  return agent.scheduling_status ?? "draft";
}

/** Completed surveys are locked — no edit or delete */
export function isSurveyCompleted(agent: Agent): boolean {
  return getSchedulingStatus(agent) === "completed";
}

export function isSurveyScheduled(agent: Agent): boolean {
  const status = getSchedulingStatus(agent);
  return status === "scheduled" || status === "processing";
}

/** Badge / label — mirrors backend `scheduling_status` only */
export type SurveyDisplayStatus = AgentSchedulingStatus;

export function getSurveyDisplayStatus(agent: Agent): SurveyDisplayStatus {
  return getSchedulingStatus(agent);
}
