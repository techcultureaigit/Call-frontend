/** Builder UI question shape (mapped to/from AgentSurveyQuestion) */

export type QuestionType =
  | "text"
  | "multiple_choice"
  | "yes_no"
  | "rating"
  | "number"
  | "checkbox"
  | "dropdown";

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options?: string[];
  order: number;
}
