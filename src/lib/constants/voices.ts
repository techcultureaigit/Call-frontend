import type { VoiceGender, VoiceProvider } from "@/types/voice";

export const VOICES_PAGE_SIZE = 8;

export const VOICE_PROVIDER_STYLES: Record<
  VoiceProvider,
  { label: string; className: string }
> = {
  openai: {
    label: "Open AI",
    className: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  google: {
    label: "Google",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  elevenlabs: {
    label: "ElevenLabs",
    className: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  },
  azure: {
    label: "Azure",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
};

export const VOICE_GENDER_STYLES: Record<
  VoiceGender,
  { label: string; className: string }
> = {
  feminine: {
    label: "Feminine",
    className: "border-pink-500/30 bg-pink-500/10 text-pink-700 dark:text-pink-400",
  },
  masculine: {
    label: "Masculine",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  neutral: {
    label: "Neutral",
    className: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400",
  },
};
