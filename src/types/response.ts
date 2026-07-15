import type { ID, Timestamps } from "./common";

export type ResponseStatus =
  | "completed"
  | "pending_review"
  | "flagged"
  | "rejected"
  | "partial";

export interface ResponseCustomerSnapshot {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
}

export interface SurveyResponseAnswer {
  questionId: ID;
  questionTitle: string;
  value: string | number | boolean | string[];
}

export interface AiExtractedData {
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  npsScore?: number;
  keyTopics: string[];
  summary: string;
  entities: Record<string, string>;
  flags: string[];
  confidence: number;
  rawExtraction: Record<string, unknown>;
}

export interface SurveyResponse extends Timestamps {
  id: ID;
  callId?: ID;
  campaignId: ID;
  campaignName: string;
  surveyId: ID;
  surveyName: string;
  customer: ResponseCustomerSnapshot;
  status: ResponseStatus;
  answers: SurveyResponseAnswer[];
  aiExtracted: AiExtractedData;
  durationSeconds: number;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
