import type { ID, Timestamps } from "./common";

export type SurveyStatus = "active" | "draft" | "archived";

export type QuestionType =
  | "text"
  | "number"
  | "rating"
  | "yes_no"
  | "multiple_choice"
  | "checkbox"
  | "dropdown";

export type ConditionalOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "greater_than"
  | "less_than";

export type ConditionalAction = "show" | "hide";

export interface ConditionalRule {
  id: ID;
  sourceQuestionId: ID;
  operator: ConditionalOperator;
  value: string;
  action: ConditionalAction;
}

export interface SurveyQuestion {
  id: ID;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  ratingMax?: number;
  placeholder?: string;
  order: number;
  conditionalLogic?: ConditionalRule[];
}

export interface Survey extends Timestamps {
  id: ID;
  name: string;
  description?: string;
  status: SurveyStatus;
  questionCount: number;
  estimatedDurationMinutes: number;
  responseCount: number;
}

export interface SurveyDetail extends Survey {
  questions: SurveyQuestion[];
}

export interface SaveSurveyPayload {
  name: string;
  description?: string;
  questions: SurveyQuestion[];
  status?: SurveyStatus;
}

export interface CreateSurveyPayload {
  name: string;
  description?: string;
}
