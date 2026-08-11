export type ProviderType = "stt" | "llm" | "tts";

export interface ProviderModel {
  id: string | null;
  name: string;
  provider_id?: string;
}

export interface ProviderItem {
  id: string;
  type: ProviderType;
  /** Canonical field */
  name: string;
  /** Alias from API for older UI */
  provider?: string;
  models: ProviderModel[];
  modelCount: number;
  active?: boolean;
  isActive: boolean;
}

export interface ProviderFormValues {
  type: ProviderType;
  name: string;
  models: ProviderModel[];
  active: boolean;
}

export const PROVIDER_TYPE_OPTIONS: { label: string; value: ProviderType }[] = [
  { label: "Listen — Speech to text (STT)", value: "stt" },
  { label: "Reason — Language model (LLM)", value: "llm" },
  { label: "Speak — Text to speech (TTS)", value: "tts" },
];

export const PROVIDER_TYPE_LABEL: Record<ProviderType, string> = {
  stt: "Listen (STT)",
  llm: "Reason (LLM)",
  tts: "Speak (TTS)",
};

export const PROVIDER_TYPE_HINT: Record<ProviderType, string> = {
  stt: "Used in survey Identity → Listen dropdown",
  llm: "Used in survey Identity → Reason dropdown",
  tts: "Used in survey Identity → Speak dropdown",
};

export function providerLabel(p: Pick<ProviderItem, "name" | "provider">): string {
  return p.name || p.provider || "";
}

export function modelLabel(m: ProviderModel): string {
  return m.name;
}
