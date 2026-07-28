import type { AgentConfig } from "@/types/agent";

export const AGENT_TOP_NAV = [
  { id: "dashboard", label: "Dashboard", href: "/survey" },
  { id: "configure", label: "Configure", href: "#" },
  { id: "conversations", label: "Conversations", href: "/survey/conversations" },
  { id: "deploy", label: "Deploy", href: "/survey/deploy" },
  { id: "campaign", label: "Survey", href: "/survey" },
] as const;

export const AGENT_CONFIG_TABS = [
  { id: "persona", label: "Identity" },
  { id: "prompts", label: "Instructions" },
  { id: "survey-questions", label: "Survey Questions" },
  { id: "client-contact", label: "Contact of Client" },
  { id: "schedule", label: "Schedule" },
  { id: "wisdom", label: "Knowledge" },
  { id: "post-call", label: "Wrap-up" },
  { id: "functions", label: "Tools" },
] as const;

/** Steps kept in the stepper but not navigable yet */
export const DISABLED_AGENT_CONFIG_TABS = [
  "wisdom",
  "post-call",
  "functions",
] as const;

export type DisabledAgentConfigTab =
  (typeof DISABLED_AGENT_CONFIG_TABS)[number];

export const ENABLED_AGENT_CONFIG_TABS = AGENT_CONFIG_TABS.filter(
  (tab) =>
    !DISABLED_AGENT_CONFIG_TABS.includes(
      tab.id as DisabledAgentConfigTab
    )
);

export function isAgentConfigTabDisabled(
  tab: (typeof AGENT_CONFIG_TABS)[number]["id"]
): boolean {
  return DISABLED_AGENT_CONFIG_TABS.includes(tab as DisabledAgentConfigTab);
}

export const AGENT_LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Chinese", value: "zh" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
];

export function getAgentLanguageLabel(code: string): string {
  return AGENT_LANGUAGES.find((l) => l.value === code)?.label ?? code;
}

export const STT_PROVIDERS = [
  { label: "Sarvam AI", value: "sarvam" },
  { label: "Deepgram", value: "deepgram" },
  { label: "OpenAI Whisper", value: "whisper" },
];

export const LLM_PROVIDERS = [
  { label: "OpenAI", value: "openai" },
  { label: "Anthropic", value: "anthropic" },
  { label: "Google", value: "google" },
];

export const TTS_PROVIDERS = [
  { label: "Google", value: "google" },
  { label: "ElevenLabs", value: "elevenlabs" },
  { label: "Azure", value: "azure" },
];

export const BACKGROUND_NOISE = [
  { label: "Off", value: "off" },
  { label: "Office", value: "office" },
  { label: "Cafe", value: "cafe" },
  { label: "Call Center", value: "call-center" },
];

export const AGENT_TOOLS = [
  { id: "end-call", name: "End Call", description: "Gracefully end the conversation" },
  { id: "call-transfer", name: "Call Transfer", description: "Transfer to human agent" },
  { id: "ppt-presenter", name: "PPT Presenter", description: "Present slides during call" },
  { id: "auto-switch-language", name: "Auto Switch Language", description: "Detect and switch language" },
  { id: "additional-detail", name: "Additional Detail (RAG)", description: "Fetch extra context from KB" },
  { id: "voice-mail", name: "Voice Mail", description: "Leave voicemail message" },
  { id: "external-transfer", name: "External Call Transfer", description: "Transfer to external number" },
];

export const QUESTION_TYPES = [
  { label: "Text Input", value: "text" },
  { label: "Yes / No", value: "yes_no" },
  { label: "Rating", value: "rating" },
  { label: "Multiple Choice", value: "multiple_choice" },
];

export const SURVEY_QUESTION_TYPES = [
  { label: "Normal Question", value: "text" },
  { label: "Yes / No", value: "yes_no" },
  { label: "Rating", value: "rating" },
  { label: "Multiple Choice", value: "multi" },
] as const;

export function getSurveyQuestionTypeLabel(type: string): string {
  if (type === "multiple_choice") return "Multiple Choice";
  return (
    SURVEY_QUESTION_TYPES.find((t) => t.value === type)?.label ?? type
  );
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  persona: {
    name: "",
    avatarId: "aria",
    modelMode: "pipeline",
    language: "en",
    audioCacheEnabled: false,
    livekitInferenceEnabled: false,
    maxCallDurationMinutes: 15,
    analyticsEnabled: true,
    aiComprehendEnabled: false,
    memoryContextEnabled: true,
    fallbackMemoryEnabled: false,
    maxContextItems: 20,
    stt: {
      provider: "sarvam",
      model: "Saaras:v3",
      fallback: { provider: "deepgram", model: "nova-2" },
      advanced: {
        highVadSensitivity: false,
        languageCode: "en-IN",
        transcribeMode: "transcribe",
        interruptionSensitivity: 0.5,
        endpointingMs: 300,
        smartFormatting: true,
      },
    },
    llm: {
      provider: "openai",
      model: "gpt-4o",
      fallback: { provider: "anthropic", model: "claude-sonnet" },
      advanced: {
        temperature: 0.7,
        maxTokens: 512,
        streaming: true,
      },
    },
    tts: {
      provider: "google",
      model: "Google",
      voice: "Aakash",
      fallback: { provider: "elevenlabs", model: "multilingual-v2", voice: "Rachel" },
      advanced: {
        speakingRate: 1,
        stability: 0.6,
        pitch: 0,
      },
    },
    backgroundNoise: "off",
  },
  prompts: {
    greeting: "Hello! Thank you for taking our call today. How are you doing?",
    greetsFirst: true,
    systemPrompt:
      "You are a professional voice AI agent for enterprise customer outreach. Conduct surveys naturally, handle objections gracefully, and maintain a warm professional tone throughout the conversation.",
  },
  wisdom: {
    websiteUrls: [],
    customKnowledge: "",
    topics: [],
  },
  functions: {
    tools: AGENT_TOOLS.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      enabled: false,
    })),
    actions: [],
  },
  surveyQuestions: {
    enabled: true,
    questions: [],
  },
  clientContact: {
    contactFileUrl: "",
    contactFileName: "",
    contacts: [],
  },
  postCall: {
    callbackUrl: "",
    callbackSecret: "",
    dispositionBuckets: [],
    questions: [],
  },
};
