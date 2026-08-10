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
  /** Present only when this answer has its own recording */
  recording_url?: string | null;
}

export interface SurveyResultCallData {
  call_status?: string;
  direction?: string;
  call_connected?: string;
  duration?: string;
  billsec?: string;
  start_stamp?: string;
  answer_stamp?: string;
  end_stamp?: string;
  agent_number?: string;
  agent_ring_time?: string;
  agent_transfer_ring_time?: string;
  customer_ring_time?: string;
  outbound_sec?: string;
  caller_id_number?: string;
  call_to_number?: string;
  customer_no_with_prefix?: string;
  answered_agent_name?: string;
  answered_agent_number?: string;
  missed_agent?: string;
  campaign_name?: string;
  custom_identifier?: string;
  digits_dialed?: string;
  broadcast_lead_fields?: string;
  hangup_cause_description?: string;
  reason_key?: string;
  received_at?: string;
  billing_circle?: { operator?: string; circle?: string } | null;
}

export interface SurveyResultRow {
  id: string;
  session_id: string;
  call_sid?: string;
  customer_number: string;
  customer_name: string;
  customer_email: string;
  customer_company: string;
  extracted_at: string | null;
  /** Optional raw map — prefer `answers` when present */
  extracted_data?: Record<string, unknown>;
  answers: SurveyResultAnswer[];
  survey_id: string;
  /** Resolved once at root (not repeated inside `call`) */
  recording_url?: string | null;
  recording_duration_seconds?: number | null;
  call?: SurveyResultCallData | null;
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
  /** Include surveyQuestions.questions (needed for export; heavier payload) */
  includeQuestions?: boolean;
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
