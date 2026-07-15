import type {
  TemplateAiModel,
  TemplateCategory,
  TemplateLanguage,
  TemplateStatus,
  TemplateVoice,
} from "@/types/campaign-template";

export const TEMPLATE_CATEGORY_OPTIONS: {
  value: TemplateCategory | "all";
  label: string;
  description?: string;
}[] = [
  { value: "all", label: "All Templates" },
  { value: "sales", label: "Sales", description: "Outbound & discovery" },
  { value: "banking", label: "Banking", description: "Financial services" },
  { value: "insurance", label: "Insurance", description: "Policy & claims" },
  { value: "healthcare", label: "Healthcare", description: "Patient experience" },
  {
    value: "customer_feedback",
    label: "Customer Feedback",
    description: "CSAT & NPS",
  },
  {
    value: "lead_qualification",
    label: "Lead Qualification",
    description: "BANT & scoring",
  },
  { value: "collections", label: "Collections", description: "Payment recovery" },
  { value: "custom", label: "Custom", description: "Build your own" },
];

export const TEMPLATE_STATUS_OPTIONS: {
  value: TemplateStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export const TEMPLATE_LANGUAGE_OPTIONS: {
  value: TemplateLanguage | "all";
  label: string;
}[] = [
  { value: "all", label: "All languages" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" },
  { value: "multi", label: "Multi-language" },
];

export const TEMPLATE_VOICE_OPTIONS: { value: TemplateVoice; label: string }[] =
  [
    { value: "neutral", label: "Neutral" },
    { value: "warm", label: "Warm" },
    { value: "professional", label: "Professional" },
    { value: "energetic", label: "Energetic" },
  ];

export const TEMPLATE_AI_MODEL_OPTIONS: {
  value: TemplateAiModel;
  label: string;
}[] = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-sonnet", label: "Claude Sonnet" },
  { value: "gemini-pro", label: "Gemini Pro" },
  { value: "custom", label: "Custom Model" },
];

export const CATEGORY_GRADIENTS: Record<TemplateCategory, string> = {
  sales: "from-indigo-500/25 via-blue-500/15 to-violet-500/8",
  banking: "from-emerald-500/25 via-teal-500/15 to-green-500/8",
  insurance: "from-amber-500/25 via-orange-500/15 to-yellow-500/8",
  healthcare: "from-rose-500/25 via-pink-500/15 to-red-500/8",
  customer_feedback: "from-violet-500/25 via-purple-500/15 to-fuchsia-500/8",
  lead_qualification: "from-blue-500/25 via-sky-500/15 to-cyan-500/8",
  collections: "from-slate-500/25 via-zinc-500/15 to-stone-500/8",
  custom: "from-fuchsia-500/25 via-purple-500/15 to-violet-500/8",
};

export const LANGUAGE_LABELS: Record<TemplateLanguage, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
  de: "DE",
  hi: "HI",
  multi: "Multi",
};
