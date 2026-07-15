export type VoiceGender = "masculine" | "feminine" | "neutral";

export type VoiceProvider = "openai" | "google" | "elevenlabs" | "azure";

export type VoiceTypeFilter = "all" | "cloned";

export type VoiceGenderFilter = "all" | VoiceGender;

export interface VoiceProfile {
  id: string;
  name: string;
  gender: VoiceGender;
  provider: VoiceProvider;
  category: string;
  language: string;
  languageLabel: string;
  description: string;
  isCloned: boolean;
}

export interface VoiceFilters {
  search: string;
  voiceType: VoiceTypeFilter;
  gender: VoiceGenderFilter;
  language: string;
}

export interface VoicesQueryResult {
  voices: VoiceProfile[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
