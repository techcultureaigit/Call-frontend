/**
 * survey-export.ts
 * Export survey list to CSV or Excel — client-side only, no API.
 * Used by survey-list.tsx (data fetched via listSurveys → GET /api/surveys).
 */
import * as XLSX from "xlsx";
import { getAgentLanguageLabel as getSurveyLanguageLabel, getSurveyQuestionTypeLabel } from "@/lib/constants/agent-config";
import { formatAgentCreatedAt as formatSurveyCreatedAt } from "@/lib/utils/date";
import { downloadCSV } from "@/lib/utils/csv";
import { withGlobalLoader } from "@/components/shared/api-loading.store";
import type { Agent as Survey, AgentSurveyQuestion as SurveyQuestion } from "@/types/agent";

export type SurveysExportFormat = "xlsx" | "csv";

const SURVEY_HEADERS = [
  "Survey Name",
  "Status",
  "Language",
  "Voice",
  "Max Duration (min)",
  "Conversations",
  "Questions Count",
  "Questions",
  "Created At",
] as const;

const QUESTION_HEADERS = [
  "Survey Name",
  "Question #",
  "Question",
  "Type",
  "Options",
  "Instruction",
] as const;

function getQuestionText(q: SurveyQuestion): string {
  if (typeof q.question === "string" && q.question.trim()) {
    return q.question.trim();
  }
  for (const [key, value] of Object.entries(q)) {
    if (["id", "_id", "type", "options", "instruction", "__v", "conditions"].includes(key)) continue;
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getQuestionInstruction(q: SurveyQuestion): string {
  if (typeof q.instruction === "string" && q.instruction.trim()) {
    return q.instruction.trim();
  }
  return "";
}

function getQuestionOptions(q: SurveyQuestion): string {
  if (!Array.isArray(q.options) || q.options.length === 0) return "";
  return q.options
    .map((opt) => (typeof opt?.label === "string" ? opt.label.trim() : ""))
    .filter(Boolean)
    .join(" | ");
}

function getSurveyQuestions(survey: Survey): SurveyQuestion[] {
  return survey.config?.surveyQuestions?.questions ?? [];
}

function formatQuestionsSummary(questions: SurveyQuestion[]): string {
  if (questions.length === 0) return "";
  return questions
    .map((q, index) => {
      const text = getQuestionText(q) || "(empty)";
      const type = getSurveyQuestionTypeLabel(String(q.type || "text"));
      const instruction = getQuestionInstruction(q);
      const options = getQuestionOptions(q);
      const extra = [
        options ? `Options: ${options}` : "",
        instruction ? `Instruction: ${instruction}` : "",
      ]
        .filter(Boolean)
        .join("; ");
      return extra
        ? `${index + 1}. [${type}] ${text} (${extra})`
        : `${index + 1}. [${type}] ${text}`;
    })
    .join("\n");
}

function surveyToRow(survey: Survey): string[] {
  const voice = survey.config.persona.tts.voiceName?.trim() || "";
  const language = getSurveyLanguageLabel(
    survey.config.persona.language || survey.language
  );
  const maxDuration = survey.config.persona.maxCallDurationMinutes;
  const status = survey.scheduling_status ?? "draft";
  const questions = getSurveyQuestions(survey);

  return [
    survey.name,
    status.toUpperCase(),
    language,
    voice,
    String(maxDuration),
    String(survey.conversationCount),
    String(questions.length),
    formatQuestionsSummary(questions),
    formatSurveyCreatedAt(survey.createdAt),
  ];
}

function questionsToRows(surveys: Survey[]): string[][] {
  const rows: string[][] = [];
  for (const survey of surveys) {
    const questions = getSurveyQuestions(survey);
    if (questions.length === 0) {
      rows.push([survey.name, "", "(no questions)", "", "", ""]);
      continue;
    }
    questions.forEach((q, index) => {
      rows.push([
        survey.name,
        String(index + 1),
        getQuestionText(q),
        getSurveyQuestionTypeLabel(String(q.type || "text")),
        getQuestionOptions(q),
        getQuestionInstruction(q),
      ]);
    });
  }
  return rows;
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function surveysToCSV(surveys: Survey[]): string {
  const surveyRows = surveys.map(surveyToRow);
  const questionRows = questionsToRows(surveys);

  const surveysBlock = [SURVEY_HEADERS as unknown as string[], ...surveyRows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  const questionsBlock = [
    QUESTION_HEADERS as unknown as string[],
    ...questionRows,
  ]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  return `${surveysBlock}\n\n${questionsBlock}`;
}

export function exportSurveysCSV(surveys: Survey[], filename?: string): void {
  const csv = surveysToCSV(surveys);
  downloadCSV(csv, filename ?? `surveys-export-${Date.now()}.csv`);
}

export function exportSurveysExcel(surveys: Survey[], filename?: string): void {
  const surveyRows = surveys.map(surveyToRow);
  const questionRows = questionsToRows(surveys);

  const surveysSheet = XLSX.utils.aoa_to_sheet([
    SURVEY_HEADERS as unknown as string[],
    ...surveyRows,
  ]);
  const questionsSheet = XLSX.utils.aoa_to_sheet([
    QUESTION_HEADERS as unknown as string[],
    ...questionRows,
  ]);

  // Wider columns for questions text
  surveysSheet["!cols"] = [
    { wch: 28 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 60 },
    { wch: 20 },
  ];
  questionsSheet["!cols"] = [
    { wch: 28 },
    { wch: 12 },
    { wch: 50 },
    { wch: 16 },
    { wch: 40 },
    { wch: 40 },
  ];

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, surveysSheet, "Surveys");
  XLSX.utils.book_append_sheet(book, questionsSheet, "Questions");
  XLSX.writeFile(book, filename ?? `surveys-export-${Date.now()}.xlsx`);
}

export async function exportSurveys(
  surveys: Survey[],
  format: SurveysExportFormat
): Promise<void> {
  await withGlobalLoader(
    async () => {
      // Yield so the global overlay can paint before heavy XLSX work
      await new Promise<void>((r) => setTimeout(r, 0));
      if (format === "xlsx") {
        exportSurveysExcel(surveys);
      } else {
        exportSurveysCSV(surveys);
      }
    },
    { label: "Exporting", hint: "Preparing your file" }
  );
}