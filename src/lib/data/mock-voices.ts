import type {
  VoiceFilters,
  VoiceGender,
  VoiceProfile,
  VoiceProvider,
  VoicesQueryResult,
} from "@/types/voice";

const BASE_NAMES = [
  "Aadhya",
  "Agni",
  "Achernar",
  "Aakash",
  "Saras",
  "Aditi",
  "Arjun",
  "Bella",
  "Charon",
  "Dharma",
  "Echo",
  "Fenrir",
  "Glimmer",
  "Helios",
  "Indigo",
  "Juniper",
  "Kore",
  "Luna",
  "Maestro",
  "Nova",
  "Orion",
  "Puck",
  "Quinn",
  "River",
  "Sage",
  "Titan",
  "Uma",
  "Vega",
  "Wren",
  "Xenon",
  "Yara",
  "Zephyr",
];

const CATEGORIES = [
  "Multilingual",
  "Arabic",
  "English",
  "Hindi",
  "Spanish",
  "French",
  "Chinese",
  "Japanese",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "ja", label: "Japanese" },
  { value: "de", label: "German" },
];

const GENDERS: VoiceGender[] = ["masculine", "feminine", "neutral"];
const PROVIDERS: VoiceProvider[] = ["openai", "google", "elevenlabs", "azure"];

function buildDescription(
  name: string,
  provider: VoiceProvider,
  category: string
): string {
  if (provider === "google") {
    return `HD Voice from chirp-3 model of google · ${category.toLowerCase()} capabilities`;
  }
  if (provider === "openai") {
    return `${name} voice with multilingual capabilities by openai tts model`;
  }
  if (provider === "elevenlabs") {
    return `Natural ${category.toLowerCase()} voice powered by ElevenLabs synthesis`;
  }
  return `Enterprise-grade ${category.toLowerCase()} voice via Azure Neural TTS`;
}

function generateVoices(): VoiceProfile[] {
  const voices: VoiceProfile[] = [];

  for (let i = 0; i < 669; i++) {
    const name = BASE_NAMES[i % BASE_NAMES.length];
    const suffix = i >= BASE_NAMES.length ? ` ${Math.floor(i / BASE_NAMES.length) + 1}` : "";
    const gender = GENDERS[i % GENDERS.length];
    const provider = PROVIDERS[i % PROVIDERS.length];
    const category = CATEGORIES[i % CATEGORIES.length];
    const lang = LANGUAGES[i % LANGUAGES.length];

    voices.push({
      id: `voice_${String(i + 1).padStart(4, "0")}`,
      name: `${name}${suffix}`.trim(),
      gender,
      provider,
      category,
      language: lang.value,
      languageLabel: lang.label,
      description: buildDescription(name, provider, category),
      isCloned: i % 11 === 0,
    });
  }

  return voices;
}

export const MOCK_VOICES = generateVoices();

export const VOICE_LANGUAGE_OPTIONS = [
  { label: "All languages", value: "" },
  ...LANGUAGES.map((l) => ({ label: l.label, value: l.value })),
];

export function filterVoices(
  voices: VoiceProfile[],
  filters: VoiceFilters
): VoiceProfile[] {
  const q = filters.search.trim().toLowerCase();

  return voices.filter((voice) => {
    if (filters.voiceType === "cloned" && !voice.isCloned) return false;
    if (filters.gender !== "all" && voice.gender !== filters.gender) return false;
    if (filters.language && voice.language !== filters.language) return false;
    if (
      q &&
      !voice.name.toLowerCase().includes(q) &&
      !voice.category.toLowerCase().includes(q) &&
      !voice.provider.toLowerCase().includes(q) &&
      !voice.description.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });
}

export function paginateVoices(
  voices: VoiceProfile[],
  page: number,
  limit: number
): VoicesQueryResult {
  const total = voices.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;

  return {
    voices: voices.slice(start, start + limit),
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}

export const DEFAULT_VOICE_FILTERS: VoiceFilters = {
  search: "",
  voiceType: "all",
  gender: "all",
  language: "",
};
