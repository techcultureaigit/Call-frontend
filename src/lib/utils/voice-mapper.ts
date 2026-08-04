import type { VoiceGender, VoiceProfile, VoiceProvider } from "@/types/voice";

/** Raw voice document from Express `/voices` */
export interface BackendVoice {
  _id: string;
  source: string;
  voiceId: string;
  name: string;
  gender?: string;
  language?: string;
  languageCode?: string;
  languageLabel?: string;
  locale?: string;
  category?: string;
  accent?: string;
  age?: string;
  useCase?: string;
  descriptive?: string;
  description?: string;
  previewUrl?: string;
}

const GENDER_MAP: Record<string, VoiceGender> = {
  male: "masculine",
  masculine: "masculine",
  female: "feminine",
  feminine: "feminine",
  neutral: "neutral",
};

const PROVIDER_MAP: Record<string, VoiceProvider> = {
  elevenlabs: "elevenlabs",
  google: "google",
  openai: "openai",
  azure: "azure",
};

export function mapBackendGender(gender?: string): VoiceGender {
  return GENDER_MAP[String(gender || "").toLowerCase()] ?? "neutral";
}

export function mapBackendProvider(source?: string): VoiceProvider {
  return PROVIDER_MAP[String(source || "").toLowerCase()] ?? "elevenlabs";
}

/** UI gender filter → backend `gender` query */
export function toBackendGender(
  gender: string
): "male" | "female" | "neutral" | undefined {
  if (gender === "masculine") return "male";
  if (gender === "feminine") return "female";
  if (gender === "neutral") return "neutral";
  return undefined;
}

export function backendVoiceToProfile(v: BackendVoice): VoiceProfile {
  const languageLabel = v.languageLabel?.trim() || v.language || "";
  const category =
    v.category?.trim() ||
    languageLabel ||
    (v.language ? v.language.toUpperCase() : "Voice");

  return {
    id: v._id,
    name: v.name,
    gender: mapBackendGender(v.gender),
    provider: mapBackendProvider(v.source),
    category,
    language: v.language || "",
    languageLabel,
    description:
      v.description?.trim() ||
      [v.descriptive, v.useCase, v.accent].filter(Boolean).join(" · ") ||
      `${v.name} voice`,
    isCloned: String(v.category || "").toLowerCase() === "cloned",
    previewUrl: v.previewUrl?.trim() || "",
    voiceId: v.voiceId,
    source: v.source,
  };
}
