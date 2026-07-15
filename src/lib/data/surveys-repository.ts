import type {
  CreateSurveyPayload,
  SaveSurveyPayload,
  Survey,
  SurveyDetail,
  SurveyQuestion,
  SurveyStatus,
} from "@/types/survey";
import { MOCK_SURVEYS, generateSurveyId } from "@/lib/data/mock-surveys";
import {
  generateQuestionId,
  getDefaultQuestionsForSurvey,
  MOCK_SURVEY_QUESTIONS,
} from "@/lib/data/mock-survey-questions";

let surveysDB: Survey[] = [...MOCK_SURVEYS];
let questionsDB: Record<string, SurveyQuestion[]> = {
  ...Object.fromEntries(
    Object.entries(MOCK_SURVEY_QUESTIONS).map(([id, qs]) => [id, [...qs]])
  ),
};

function estimateDuration(questions: SurveyQuestion[]): number {
  if (questions.length === 0) return 1;
  const minutes = questions.reduce((acc, q) => {
    switch (q.type) {
      case "text":
        return acc + 0.75;
      case "rating":
      case "yes_no":
        return acc + 0.25;
      case "multiple_choice":
      case "dropdown":
        return acc + 0.5;
      case "checkbox":
        return acc + 0.6;
      case "number":
        return acc + 0.3;
      default:
        return acc + 0.5;
    }
  }, 0);
  return Math.max(1, Math.round(minutes));
}

function normalizeOrder(questions: SurveyQuestion[]): SurveyQuestion[] {
  return questions.map((q, i) => ({ ...q, order: i }));
}

export function listSurveys(search = ""): Survey[] {
  if (!search.trim()) return [...surveysDB];
  const q = search.toLowerCase();
  return surveysDB.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
  );
}

export function listActiveSurveys(): Survey[] {
  return surveysDB.filter((s) => s.status === "active");
}

export function getSurveyById(id: string): Survey | undefined {
  return surveysDB.find((s) => s.id === id);
}

export function getSurveyDetail(id: string): SurveyDetail | undefined {
  const survey = getSurveyById(id);
  if (!survey) return undefined;
  const questions = questionsDB[id] ?? getDefaultQuestionsForSurvey(id);
  if (!questionsDB[id]) questionsDB[id] = [...questions];
  return { ...survey, questions: normalizeOrder([...questions]) };
}

export function createSurvey(payload: CreateSurveyPayload): SurveyDetail {
  const now = new Date().toISOString();
  const id = generateSurveyId();
  const survey: Survey = {
    id,
    name: payload.name,
    description: payload.description,
    status: "draft",
    questionCount: 0,
    estimatedDurationMinutes: 1,
    responseCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  surveysDB = [survey, ...surveysDB];
  questionsDB[id] = [];
  return { ...survey, questions: [] };
}

export function saveSurvey(
  id: string,
  payload: SaveSurveyPayload
): SurveyDetail | null {
  const index = surveysDB.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const questions = normalizeOrder(payload.questions);
  const now = new Date().toISOString();

  const updated: Survey = {
    ...surveysDB[index],
    name: payload.name,
    description: payload.description,
    status: payload.status ?? surveysDB[index].status,
    questionCount: questions.length,
    estimatedDurationMinutes: estimateDuration(questions),
    updatedAt: now,
  };

  surveysDB[index] = updated;
  questionsDB[id] = questions;

  return { ...updated, questions };
}

export function toggleSurveyPublish(
  id: string,
  published: boolean
): SurveyDetail | null {
  const status: SurveyStatus = published ? "active" : "draft";
  const detail = getSurveyDetail(id);
  if (!detail) return null;
  return saveSurvey(id, {
    name: detail.name,
    description: detail.description,
    questions: detail.questions,
    status,
  });
}

export function deleteSurvey(id: string): boolean {
  const len = surveysDB.length;
  surveysDB = surveysDB.filter((s) => s.id !== id);
  delete questionsDB[id];
  return surveysDB.length < len;
}

export function duplicateQuestion(
  surveyId: string,
  questionId: string
): SurveyQuestion | null {
  const questions = questionsDB[surveyId];
  if (!questions) return null;
  const source = questions.find((q) => q.id === questionId);
  if (!source) return null;
  const copy: SurveyQuestion = {
    ...structuredClone(source),
    id: generateQuestionId(),
    title: `${source.title} (copy)`,
    order: questions.length,
  };
  questionsDB[surveyId] = [...questions, copy];
  return copy;
}
