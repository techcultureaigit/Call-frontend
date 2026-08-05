/**
 * survey-types.ts
 * Survey types — list params, results, save/schedule inputs.
 * No API calls.
 */
import type { PaginatedMeta } from "@/types";
import type {
  Agent as Survey,
  AgentConfig as SurveyConfig,
  AgentSchedule as SurveySchedule,
} from "@/types/agent";

export interface SurveyResultAnswer {
  questionId: string;
  question: string;
  type: string;
  answer: string;
  rawAnswer: unknown;
}

export interface SurveyResultRow {
  id: string;
  session_id: string;
  customer_number: string;
  customer_name: string;
  customer_email: string;
  customer_company: string;
  extracted_at: string | null;
  extracted_data: Record<string, unknown>;
  answers: SurveyResultAnswer[];
  survey_id: string;
}

export interface SurveyResultQuestionOption {
  id?: string;
  label: string;
  value: string;
}

export interface SurveyResultQuestionMeta {
  id: string;
  question: string;
  type: string;
  options?: SurveyResultQuestionOption[];
}

export interface SurveyResultsSurveyMeta {
  id: string;
  name: string;
  scheduling_status?: string;
  questions: SurveyResultQuestionMeta[];
}

export interface SurveysListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  language?: string;
}

export interface SurveyResultsListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export type SurveyResultsExportFormat = "xlsx" | "csv";

export interface SurveyResultsExportParams {
  format?: SurveyResultsExportFormat;
  search?: string;
}

export interface SaveSurveyInput {
  id?: string;
  config: SurveyConfig;
  step?: number;
}

export interface ScheduleSurveyInput {
  enabled?: boolean;
  startAt?: string;
  endAt?: string | null;
  timezone?: string;
  recurrence?: SurveySchedule["recurrence"];
}

export interface SurveysListResult {
  data: Survey[];
  meta: PaginatedMeta;
}

export interface SurveyResultsListResult {
  data: SurveyResultRow[];
  survey: SurveyResultsSurveyMeta | null;
  meta: PaginatedMeta;
}
