import {
  MOCK_SURVEY_TEMPLATES,
} from "@/lib/data/mock-survey-templates";
import type { SurveyTemplate } from "@/types/survey-template";

export interface SurveyTemplatesQueryParams {
  search?: string;
  industry?: string;
}

export function querySurveyTemplates(
  params: SurveyTemplatesQueryParams = {}
): SurveyTemplate[] {
  const { search = "", industry = "all" } = params;
  let result = [...MOCK_SURVEY_TEMPLATES];

  if (industry && industry !== "all") {
    result = result.filter((t) => t.industry === industry);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.industryLabel.toLowerCase().includes(q) ||
        t.useCase.toLowerCase().includes(q)
    );
  }

  return result;
}

export function getSurveyTemplateById(
  id: string
): SurveyTemplate | undefined {
  return MOCK_SURVEY_TEMPLATES.find((t) => t.id === id);
}
