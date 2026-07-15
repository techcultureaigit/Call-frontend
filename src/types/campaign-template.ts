import type { ID, Timestamps } from "./common";

export type TemplateCategory =
  | "sales"
  | "banking"
  | "insurance"
  | "healthcare"
  | "customer_feedback"
  | "lead_qualification"
  | "collections"
  | "custom";

export type TemplateStatus = "active" | "draft" | "archived";

export type TemplateLanguage =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "hi"
  | "multi";

export type TemplateVoice = "neutral" | "warm" | "professional" | "energetic";

export type TemplateAiModel = "gpt-4o" | "claude-sonnet" | "gemini-pro" | "custom";

export interface TemplateQuestion {
  id: ID;
  order: number;
  text: string;
  type: "rating" | "open" | "yes_no" | "multiple_choice";
  required: boolean;
}

export interface TemplateSurveyStep {
  id: ID;
  title: string;
  description?: string;
  questionIds: string[];
}

export interface CampaignTemplate extends Timestamps {
  id: ID;
  name: string;
  description: string;
  category: TemplateCategory;
  status: TemplateStatus;
  language: TemplateLanguage;
  languages: TemplateLanguage[];
  surveyId?: string;
  surveyName: string;
  voice: TemplateVoice;
  aiModel: TemplateAiModel;
  isAiPowered: boolean;
  estimatedDurationMinutes: number;
  estimatedCallTimeMinutes: number;
  questionCount: number;
  usageCount: number;
  lastUsedAt?: string;
  icon: string;
  gradient: string;
  thumbnailAccent: string;
  aiPromptPreview: string;
  surveyFlow: TemplateSurveyStep[];
  questions: TemplateQuestion[];
  tags: string[];
}

export interface TemplateStats {
  total: number;
  active: number;
  aiPowered: number;
  recentlyUsed: number;
  byCategory: Record<TemplateCategory, number>;
}

export interface CreateTemplatePayload {
  name: string;
  description: string;
  category: TemplateCategory;
  language: TemplateLanguage;
  surveyId?: string;
  surveyName?: string;
  voice: TemplateVoice;
  aiModel: TemplateAiModel;
  status: TemplateStatus;
}

export interface TemplatesQueryParams {
  search?: string;
  category?: TemplateCategory | "all";
  status?: TemplateStatus | "all";
  language?: TemplateLanguage | "all";
  aiOnly?: boolean;
}
