import type { ID, Timestamps } from "./common";

export type AgentConfigTab =
  | "persona"
  | "prompts"
  | "wisdom"
  | "functions"
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

export interface AgentConfig {
  persona: AgentPersonaConfig;
  prompts: AgentPromptsConfig;
  wisdom: AgentWisdomConfig;
  functions: AgentFunctionsConfig;
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
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}
