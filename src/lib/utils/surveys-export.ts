import * as XLSX from "xlsx";
import {
  getAgentLanguageLabel,
  getSurveyQuestionTypeLabel,
} from "@/lib/constants/agent-config";
import { formatAgentCreatedAt } from "@/lib/utils/date";
import { downloadCSV } from "@/lib/utils/csv";
import { getSurveyDisplayStatus } from "@/lib/utils/survey-readiness";
import type { Agent, AgentSurveyQuestion } from "@/types/agent";

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
] as const;

function getQuestionText(q: AgentSurveyQuestion): string {
  if (typeof q.question === "string" && q.question.trim()) {
    return q.question.trim();
  }
  for (const [key, value] of Object.entries(q)) {
    if (["id", "_id", "type", "options", "__v"].includes(key)) continue;
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getQuestionOptions(q: AgentSurveyQuestion): string {
  if (!Array.isArray(q.options) || q.options.length === 0) return "";
  return q.options
    .map((opt) => (typeof opt?.label === "string" ? opt.label.trim() : ""))
    .filter(Boolean)
    .join(" | ");
}

function getSurveyQuestions(agent: Agent): AgentSurveyQuestion[] {
  return agent.config?.surveyQuestions?.questions ?? [];
}

function formatQuestionsSummary(questions: AgentSurveyQuestion[]): string {
  if (questions.length === 0) return "";
  return questions
    .map((q, index) => {
      const text = getQuestionText(q) || "(empty)";
      const type = getSurveyQuestionTypeLabel(String(q.type || "text"));
      const options = getQuestionOptions(q);
      return options
        ? `${index + 1}. [${type}] ${text} (Options: ${options})`
        : `${index + 1}. [${type}] ${text}`;
    })
    .join("\n");
}

function surveyToRow(agent: Agent): string[] {
  const voice = agent.config.persona.tts.voice?.trim() || "";
  const language = getAgentLanguageLabel(
    agent.config.persona.language || agent.language
  );
  const maxDuration = agent.config.persona.maxCallDurationMinutes;
  const status = getSurveyDisplayStatus(agent);
  const questions = getSurveyQuestions(agent);

  return [
    agent.name,
    status.toUpperCase(),
    language,
    voice,
    String(maxDuration),
    String(agent.conversationCount),
    String(questions.length),
    formatQuestionsSummary(questions),
    formatAgentCreatedAt(agent.createdAt),
  ];
}

function questionsToRows(agents: Agent[]): string[][] {
  const rows: string[][] = [];
  for (const agent of agents) {
    const questions = getSurveyQuestions(agent);
    if (questions.length === 0) {
      rows.push([agent.name, "", "(no questions)", "", ""]);
      continue;
    }
    questions.forEach((q, index) => {
      rows.push([
        agent.name,
        String(index + 1),
        getQuestionText(q),
        getSurveyQuestionTypeLabel(String(q.type || "text")),
        getQuestionOptions(q),
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

export function surveysToCSV(agents: Agent[]): string {
  const surveyRows = agents.map(surveyToRow);
  const questionRows = questionsToRows(agents);

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

export function exportSurveysCSV(agents: Agent[], filename?: string): void {
  const csv = surveysToCSV(agents);
  downloadCSV(csv, filename ?? `surveys-export-${Date.now()}.csv`);
}

export function exportSurveysExcel(agents: Agent[], filename?: string): void {
  const surveyRows = agents.map(surveyToRow);
  const questionRows = questionsToRows(agents);

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
  ];

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, surveysSheet, "Surveys");
  XLSX.utils.book_append_sheet(book, questionsSheet, "Questions");
  XLSX.writeFile(book, filename ?? `surveys-export-${Date.now()}.xlsx`);
}

export function exportSurveys(
  agents: Agent[],
  format: SurveysExportFormat
): void {
  if (format === "xlsx") {
    exportSurveysExcel(agents);
  } else {
    exportSurveysCSV(agents);
  }
}
