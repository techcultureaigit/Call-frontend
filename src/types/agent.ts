import type { ID, Timestamps } from "./common";

export type AgentConfigTab =
  | "persona"
  | "prompts"
  | "functions"
  | "survey-questions"
  | "farewell"
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
  /** Providers collection document id */
  providerId?: string;
  /** Model subdocument id on the provider */
  modelId?: string;
  /** Voice collection document id */
  voice?: string;
  /** Display name from the populated voice response */
  voiceName?: string;
  /** Provider/Cloudinary audio preview from the populated voice response */
  voicePreviewUrl?: string;
  /** Speaking rate for the selected voice — 1 is normal */
  tts_speed?: number;
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
  farewell: string;
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

/** Manual or uploaded — uploaded rows keep any spreadsheet columns */
export interface AgentSurveyQuestion {
  id: string;
  type?: string;
  question?: string;
  options?: AgentSurveyQuestionOption[];
  [key: string]: unknown;
}

export interface AgentSurveyQuestionsConfig {
  enabled: boolean;
  /** Only set when questions were uploaded via CSV/Excel */
  questionsFileUrl?: string;
  questionsFileName?: string;
  questions: AgentSurveyQuestion[];
}

/** Contact row — single `contact` phone number column */
export type AgentClientContactRow = { contact: string };

export interface AgentClientContactConfig {
  contactFileUrl: string;
  contactFileName: string;
  /** Parsed contact numbers cached after upload */
  contacts?: AgentClientContactRow[];
}

export type AgentScheduleRecurrence = "once" | "daily" | "weekly" | "monthly";

export interface AgentSchedule {
  enabled: boolean;
  startAt: string | null;
  endAt: string | null;
  timezone: string;
  recurrence: AgentScheduleRecurrence;
  lastScheduledAt: string | null;
}

export interface AgentStepProgress {
  complete: boolean;
  optional?: boolean;
  missing: string[];
}

export interface AgentProgress {
  identity: AgentStepProgress;
  prompts: AgentStepProgress;
  "survey-questions": AgentStepProgress;
  farewell: AgentStepProgress;
  "client-contact": AgentStepProgress;
  schedule: AgentStepProgress;
  overallComplete: boolean;
  completedRequiredSteps: number;
  totalRequiredSteps: number;
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

export type AgentSchedulingStatus =
  | "draft"
  | "scheduled"
  | "completed"
  | "processing";

export interface Agent extends Timestamps {
  id: ID;
  name: string;
  /** Replaces legacy status — draft by default; scheduled on schedule action */
  scheduling_status: AgentSchedulingStatus;
  language: string;
  modelMode: AgentModelMode;
  phone?: string | null;
  conversationCount: number;
  config: AgentConfig;
  schedule?: AgentSchedule | null;
  progress?: AgentProgress;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}
