/** Map agent question shape ↔ builder question shape (builder UI only) */
import type { AgentSurveyQuestion } from "@/types/agent";
import type { QuestionType, SurveyQuestion } from "@/types/survey";

function toBuilderType(type: string): QuestionType {
  if (type === "multi" || type === "multiple_choice") return "multiple_choice";
  if (type === "yes_no") return "yes_no";
  if (type === "rating") return "rating";
  if (type === "number") return "number";
  if (type === "checkbox") return "checkbox";
  if (type === "dropdown") return "dropdown";
  return "text";
}

function toAgentType(type: QuestionType): string {
  if (type === "multiple_choice" || type === "checkbox" || type === "dropdown") {
    return "multi";
  }
  return type;
}

export function agentQuestionsToBuilder(
  questions: AgentSurveyQuestion[]
): SurveyQuestion[] {
  return questions.map((q, index) => ({
    id: q.id,
    type: toBuilderType(typeof q.type === "string" ? q.type : "text"),
    title:
      (typeof q.question === "string" && q.question) ||
      Object.entries(q)
        .filter(
          ([k, v]) =>
            !["id", "_id", "type", "options", "__v"].includes(k) &&
            typeof v === "string" &&
            v.trim()
        )
        .map(([, v]) => String(v))[0] ||
      "Untitled",
    required: false,
    options: Array.isArray(q.options)
      ? q.options.map((o) => o.label)
      : undefined,
    order: index,
  }));
}

export function builderQuestionsToAgent(
  questions: SurveyQuestion[]
): AgentSurveyQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    type: toAgentType(q.type),
    question: q.title,
    options: q.options?.map((label, i) => ({
      id: `opt-${q.id}-${i}`,
      label,
      value: label.toLowerCase().replace(/\s+/g, "_"),
    })),
  }));
}
