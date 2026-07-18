import type { AgentConfig } from "@/types/agent";

export const AGENT_TOP_NAV = [
  { id: "dashboard", label: "Dashboard", href: "/agents" },
  { id: "configure", label: "Configure", href: "#" },
  { id: "conversations", label: "Conversations", href: "/agents/conversations" },
  { id: "deploy", label: "Deploy", href: "/agents/deploy" },
  { id: "campaign", label: "Campaign", href: "/campaigns/new" },
] as const;

export const AGENT_CONFIG_TABS = [
  { id: "persona", label: "Identity" },
  { id: "prompts", label: "Instructions" },
  { id: "wisdom", label: "Knowledge" },
  { id: "functions", label: "Tools" },
  { id: "post-call", label: "Wrap-up" },
] as const;

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

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  persona: {
    name: "",
    modelMode: "quantum",
    language: "en",
    audioCacheEnabled: false,
    livekitInferenceEnabled: false,
    maxCallDurationMinutes: 15,
    stt: { provider: "sarvam", model: "Saaras:v3" },
    llm: { provider: "openai", model: "gpt-4o" },
    tts: { provider: "google", model: "Google", voice: "Aakash" },
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
  postCall: {
    callbackUrl: "",
    callbackSecret: "",
    dispositionBuckets: [],
    questions: [],
  },
};
