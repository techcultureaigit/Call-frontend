import type { AgentConfig, AgentConfigTab } from "@/types/agent";

export const DEFAULT_FAREWELL =
  "Thank you very much for your valuable time. We sincerely appreciate your participation in this survey. Have a wonderful day!";

export const AGENT_TOP_NAV = [
  { id: "dashboard", label: "Dashboard", href: "/survey" },
  { id: "configure", label: "Configure", href: "#" },
  { id: "conversations", label: "Conversations", href: "/survey/conversations" },
  { id: "deploy", label: "Deploy", href: "/survey/deploy" },
  { id: "campaign", label: "My Surveys", href: "/survey" },
] as const;

export const AGENT_CONFIG_TABS = [
  { id: "persona", label: "Identity" },
  { id: "prompts", label: "Instructions" },
  { id: "survey-questions", label: "Survey Questions" },
  { id: "farewell", label: "Farewell" },
  { id: "client-contact", label: "Contact of Client" },
  { id: "schedule", label: "Schedule" },
  // Upcoming steps — keep commented (do not delete). Re-enable when ready.
  // { id: "wisdom", label: "Knowledge" },
  // { id: "post-call", label: "Wrap-up" },
  // { id: "functions", label: "Tools" },
] as const;

/** Upcoming / disabled steps — kept for reference; currently not in AGENT_CONFIG_TABS */
export const DISABLED_AGENT_CONFIG_TABS = [
  // "wisdom",
  // "post-call",
  // "functions",
] as const;

export type DisabledAgentConfigTab =
  (typeof DISABLED_AGENT_CONFIG_TABS)[number];

export const ENABLED_AGENT_CONFIG_TABS = AGENT_CONFIG_TABS.filter(
  (tab) =>
    !(DISABLED_AGENT_CONFIG_TABS as readonly string[]).includes(tab.id)
);

/** Tabs currently in the stepper (excludes commented upcoming steps). */
const ACTIVE_AGENT_CONFIG_TAB_IDS = new Set<string>(
  AGENT_CONFIG_TABS.map((tab) => tab.id)
);

export function isAgentConfigTabDisabled(tab: AgentConfigTab): boolean {
  if (!ACTIVE_AGENT_CONFIG_TAB_IDS.has(tab)) return true;
  return (DISABLED_AGENT_CONFIG_TABS as readonly string[]).includes(tab);
}

/** India languages — English + all 22 Eighth Schedule languages (ISO 639 codes). */
export const AGENT_LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Assamese", value: "as" },
  { label: "Bengali", value: "bn" },
  { label: "Bodo", value: "brx" },
  { label: "Dogri", value: "doi" },
  { label: "Gujarati", value: "gu" },
  { label: "Kannada", value: "kn" },
  { label: "Kashmiri", value: "ks" },
  { label: "Konkani", value: "kok" },
  { label: "Maithili", value: "mai" },
  { label: "Malayalam", value: "ml" },
  { label: "Manipuri (Meitei)", value: "mni" },
  { label: "Marathi", value: "mr" },
  { label: "Nepali", value: "ne" },
  { label: "Odia", value: "or" },
  { label: "Punjabi", value: "pa" },
  { label: "Sanskrit", value: "sa" },
  { label: "Santali", value: "sat" },
  { label: "Sindhi", value: "sd" },
  { label: "Tamil", value: "ta" },
  { label: "Telugu", value: "te" },
  { label: "Urdu", value: "ur" },
];

export function getAgentLanguageLabel(code: string): string {
  return AGENT_LANGUAGES.find((l) => l.value === code)?.label ?? code;
}

export const AGENT_TOOLS = [
  { id: "end-call", name: "End Call", description: "Gracefully end the conversation" },
  { id: "call-transfer", name: "Call Transfer", description: "Transfer to human agent" },
  { id: "ppt-presenter", name: "PPT Presenter", description: "Present slides during call" },
  { id: "auto-switch-language", name: "Auto Switch Language", description: "Detect and switch language" },
  { id: "additional-detail", name: "Additional Detail (RAG)", description: "Fetch extra context from KB" },
  { id: "voice-mail", name: "Voice Mail", description: "Leave voicemail message" },
  { id: "external-transfer", name: "External Call Transfer", description: "Transfer to external number" },
];

export const DEFAULT_VOICE_SPEED = 1;

export const DEFAULT_NOISE_TYPE = "off";
export const DEFAULT_NOISE_VOLUME = 1;

/** Background noise options — clips from `background voice/ambience` (served via /audio/noise) */
export const NOISE_TYPE_OPTIONS = [
  { label: "Off", value: "off", previewUrl: "" },
  {
    label: "City Ambience",
    value: "city_ambience",
    previewUrl: "/audio/noise/city_ambience.ogg",
  },
  {
    label: "Crowded Room",
    value: "crowded_room",
    previewUrl: "/audio/noise/crowded_room.ogg",
  },
  {
    label: "Forest Ambience",
    value: "forest_ambience",
    previewUrl: "/audio/noise/forest_ambience.wav",
  },
  {
    label: "Office Ambience",
    value: "office_ambience",
    previewUrl: "/audio/noise/office_ambience.wav",
  },
  {
    label: "Office Fan",
    value: "office_fan_ambience",
    previewUrl: "/audio/noise/office_fan_ambience.wav",
  },
  {
    label: "Typing",
    value: "typing_ambience",
    previewUrl: "/audio/noise/typing_ambience.wav",
  },
] as const;

export function getNoisePreviewUrl(noiseType: string): string {
  return (
    NOISE_TYPE_OPTIONS.find((o) => o.value === noiseType)?.previewUrl ?? ""
  );
}

/** TTS rates supported by the survey voice configuration */
export const VOICE_SPEED_OPTIONS = [
  { label: "0.7x", value: "0.7" },
  { label: "0.8x", value: "0.8" },
  { label: "0.9x", value: "0.9" },
  { label: "Normal (1.0x)", value: "1" },
  { label: "1.1x", value: "1.1" },
  { label: "1.2x", value: "1.2" },
] as const;

export function normalizeVoiceSpeed(value: unknown): number {
  const num = Number(value);
  return VOICE_SPEED_OPTIONS.some((o) => Number(o.value) === num)
    ? num
    : DEFAULT_VOICE_SPEED;
}

export function getVoiceSpeedLabel(value: unknown): string {
  const speed = normalizeVoiceSpeed(value);
  return (
    VOICE_SPEED_OPTIONS.find((o) => Number(o.value) === speed)?.label ??
    `${speed}x`
  );
}

export const SURVEY_QUESTION_TYPES = [
  { label: "Normal Question", value: "text" },
  { label: "Yes / No", value: "yes_no" },
  { label: "Rating", value: "rating" },
  { label: "Number", value: "number" },
  { label: "Multiple Choice", value: "multi" },
] as const;

export function getSurveyQuestionTypeLabel(type: string): string {
  if (type === "multiple_choice") return "Multiple Choice";
  if (type === "numeric" || type === "integer" || type === "int") return "Number";
  return (
    SURVEY_QUESTION_TYPES.find((t) => t.value === type)?.label ?? type
  );
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  persona: {
    name: "",
    avatarId: "aria",
    modelMode: "pipeline",
    language: "hi",
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
        languageCode: "hi-IN",
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
      /** Set from Identity → Speak Voice Explorer (language + provider) */
      voice: "",
      tts_speed: 1,
      fallback: {
        provider: "elevenlabs",
        model: "Eleven_flash_v2_5",
        voice: "",
      },
      advanced: {
        speakingRate: 1,
        stability: 0.6,
        pitch: 0,
      },
    },
    noise_type: DEFAULT_NOISE_TYPE,
    volume: DEFAULT_NOISE_VOLUME,
  },
  prompts: {
    greeting: "",
    greetsFirst: true,
    systemPrompt: "",
    farewell: "",
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
    questionsFileUrl: "",
    questionsFileName: "",
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
