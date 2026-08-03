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
