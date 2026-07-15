import type { SurveyQuestion } from "@/types/survey";

export function generateQuestionId(): string {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function generateRuleId(): string {
  return `rule_${Date.now().toString(36)}`;
}

export const MOCK_SURVEY_QUESTIONS: Record<string, SurveyQuestion[]> = {
  srv_001: [
    {
      id: "q_001_1",
      type: "rating",
      title: "How likely are you to recommend our product to a colleague?",
      description: "On a scale of 0 to 10",
      required: true,
      ratingMax: 10,
      order: 0,
    },
    {
      id: "q_001_2",
      type: "text",
      title: "What is the primary reason for your score?",
      required: false,
      placeholder: "Share your thoughts...",
      order: 1,
      conditionalLogic: [
        {
          id: "rule_001",
          sourceQuestionId: "q_001_1",
          operator: "less_than",
          value: "7",
          action: "show",
        },
      ],
    },
    {
      id: "q_001_3",
      type: "multiple_choice",
      title: "Which features do you use most?",
      required: true,
      options: ["Analytics", "Campaigns", "CRM", "Reporting", "Integrations"],
      order: 2,
    },
    {
      id: "q_001_4",
      type: "yes_no",
      title: "Would you be open to a follow-up call?",
      required: true,
      order: 3,
    },
  ],
  srv_002: [
    {
      id: "q_002_1",
      type: "rating",
      title: "How satisfied are you with your recent purchase?",
      required: true,
      ratingMax: 5,
      order: 0,
    },
    {
      id: "q_002_2",
      type: "dropdown",
      title: "Which product did you purchase?",
      required: true,
      options: ["Starter Plan", "Pro Plan", "Enterprise Plan", "Add-on Module"],
      order: 1,
    },
    {
      id: "q_002_3",
      type: "checkbox",
      title: "What aspects could be improved?",
      required: false,
      options: ["Speed", "UI/UX", "Support", "Pricing", "Documentation"],
      order: 2,
    },
    {
      id: "q_002_4",
      type: "number",
      title: "How many team members use the product?",
      placeholder: "Enter a number",
      required: false,
      order: 3,
    },
  ],
  srv_006: [
    {
      id: "q_006_1",
      type: "text",
      title: "What was your first impression of our platform?",
      required: true,
      placeholder: "Tell us about your onboarding experience...",
      order: 0,
    },
    {
      id: "q_006_2",
      type: "yes_no",
      title: "Did you complete the onboarding checklist?",
      required: true,
      order: 1,
    },
    {
      id: "q_006_3",
      type: "rating",
      title: "Rate the onboarding experience",
      required: true,
      ratingMax: 5,
      order: 2,
    },
  ],
};

export function getDefaultQuestionsForSurvey(surveyId: string): SurveyQuestion[] {
  return MOCK_SURVEY_QUESTIONS[surveyId]
    ? structuredClone(MOCK_SURVEY_QUESTIONS[surveyId])
    : [];
}
