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

export interface SurveyResultTranscription {
  speaker: string;
  text_content: string;
  timestamp: string | null;
}

export interface SurveyResultCallData {




  duration?: string;
  start_stamp?: string;
  answer_stamp?: string;
  end_stamp?: string;
  caller_id_number?: string;
  hangup_cause_description?: string;
  reason_key?: string;
}

export type SurveyResultStatus =
  | "missed"
  | "completed"
  | "partially completed";

export interface SurveyResultRow {
  id: string;
  customer_number: string;
  extracted_at: string | null;
  /** missed | completed | partially completed — empty treated as missed */
  status?: SurveyResultStatus | string;
  /** Optional raw map — prefer `answers` when present */
  extracted_data?: Record<string, unknown>;
  answers: SurveyResultAnswer[];
  survey_id: string;
  /** Resolved once at root (not repeated inside `call`) */
  recording_url?: string | null;
  recording_duration_seconds?: number | null;
  call?: SurveyResultCallData | null;
  /** True when this response has chat turns (list + detail) */
  has_transcription?: boolean;
  /** Present on GET /results/:resultId only (not list) */
  transcriptions?: SurveyResultTranscription[];
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
  instruction?: string;
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
  /** Filter by computed status: missed | completed | partially completed */
  status?: string;
}

export type SurveyResultsExportFormat = "xlsx" | "csv";

export interface SurveyResultsExportParams {
  format?: SurveyResultsExportFormat;
  search?: string;
  status?: string;
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
  callWindowStart?: string;
  callWindowEnd?: string;
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
