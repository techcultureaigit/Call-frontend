import type { ID, Timestamps } from "./common";

export type AgentConfigTab =
  | "persona"
  | "prompts"
  | "functions"
  | "survey-questions"
  | "client-contact"
  | "schedule"
  | "wisdom"
  | "post-call";

export type AgentTopNav = "dashboard" | "configure" | "conversations" | "deploy" | "campaign";

export type AgentModelMode = "pipeline";

export interface AgentStackAdvanced {
  /** STT */
  highVadSensitivity?: boolean;
  languageCode?: string;
  transcribeMode?: string;
  interruptionSensitivity?: number;
  endpointingMs?: number;
  smartFormatting?: boolean;
  /** LLM */
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
  /** TTS */
  speakingRate?: number;
  stability?: number;
  pitch?: number;
}

export interface AgentStackFallback {
  provider: string;
  model: string;
  voice?: string;
}

export interface AgentStackConfig {
  provider: string;
  model: string;
  voice?: string;
  fallback?: AgentStackFallback;
  advanced?: AgentStackAdvanced;
}

export interface AgentPersonaConfig {
  name: string;
  avatarId: string;
  modelMode: AgentModelMode;
  language: string;
  audioCacheEnabled: boolean;
  livekitInferenceEnabled: boolean;
  maxCallDurationMinutes: number;
  analyticsEnabled: boolean;
  aiComprehendEnabled: boolean;
  memoryContextEnabled: boolean;
  fallbackMemoryEnabled: boolean;
  maxContextItems: number;
  stt: AgentStackConfig;
  llm: AgentStackConfig;
  tts: AgentStackConfig;
  backgroundNoise: string;
}

export interface AgentPromptsConfig {
  greeting: string;
  greetsFirst: boolean;
  systemPrompt: string;
}

export interface AgentWisdomConfig {
  websiteUrls: string[];
  customKnowledge: string;
  topics: string[];
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface AgentAction {
  id: string;
  name: string;
  description: string;
}

export interface AgentFunctionsConfig {
  tools: AgentTool[];
  actions: AgentAction[];
}

export interface DispositionBucket {
  id: string;
  name: string;
  description: string;
}

export interface PostCallQuestion {
  id: string;
  type: string;
  question: string;
}

export interface AgentPostCallConfig {
  callbackUrl: string;
  callbackSecret: string;
  dispositionBuckets: DispositionBucket[];
  questions: PostCallQuestion[];
}

export interface AgentSurveyQuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface AgentSurveyQuestion {
  id: string;
  type: string;
  question: string;
  options?: AgentSurveyQuestionOption[];
}

export interface AgentSurveyQuestionsConfig {
  enabled: boolean;
  questions: AgentSurveyQuestion[];
}

export interface AgentClientContactConfig {
  contactFileUrl: string;
  contactFileName: string;
  /** Parsed rows cached after upload; view can also reload from contactFileUrl */
  contacts?: Array<{
    name: string;
    phone: string;
    email: string;
    company: string;
  }>;
}

export type AgentScheduleRecurrence = "once" | "daily" | "weekly" | "monthly";

export type AgentScheduleStatus =
  | "idle"
  | "scheduled"
  | "running"
  | "completed"
  | "cancelled";

export interface AgentSchedule {
  enabled: boolean;
  startAt: string | null;
  endAt: string | null;
  timezone: string;
  recurrence: AgentScheduleRecurrence;
  status: AgentScheduleStatus;
  lastScheduledAt: string | null;
}

export interface AgentConfig {
  persona: AgentPersonaConfig;
  prompts: AgentPromptsConfig;
  functions: AgentFunctionsConfig;
  surveyQuestions: AgentSurveyQuestionsConfig;
  clientContact: AgentClientContactConfig;
  wisdom: AgentWisdomConfig;
  postCall: AgentPostCallConfig;
}

export interface Agent extends Timestamps {
  id: ID;
  uuid: string;
  name: string;
  status: "draft" | "active" | "paused";
  language: string;
  modelMode: AgentModelMode;
  phone?: string | null;
  conversationCount: number;
  config: AgentConfig;
  schedule?: AgentSchedule | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}
