import * as XLSX from "xlsx";
import { getAgentLanguageLabel } from "@/lib/constants/agent-config";
import { formatAgentCreatedAt } from "@/lib/utils/date";
import { downloadCSV } from "@/lib/utils/csv";
import { getSurveyDisplayStatus } from "@/lib/utils/survey-readiness";
import type { Agent } from "@/types/agent";

export type SurveysExportFormat = "xlsx" | "csv";

const HEADERS = [
  "Survey Name",
  "Status",
  "Language",
  "Voice",
  "Max Duration (min)",
  "Conversations",
  "Created At",
] as const;

function surveyToRow(agent: Agent): string[] {
  const voice = agent.config.persona.tts.voice?.trim() || "";
  const language = getAgentLanguageLabel(
    agent.config.persona.language || agent.language
  );
  const maxDuration = agent.config.persona.maxCallDurationMinutes;
  const status = getSurveyDisplayStatus(agent);

  return [
    agent.name,
    status.toUpperCase(),
    language,
    voice,
    String(maxDuration),
    String(agent.conversationCount),
    formatAgentCreatedAt(agent.createdAt),
  ];
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function surveysToCSV(agents: Agent[]): string {
  const rows = agents.map(surveyToRow);
  return [HEADERS as unknown as string[], ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
}

export function exportSurveysCSV(agents: Agent[], filename?: string): void {
  const csv = surveysToCSV(agents);
  downloadCSV(csv, filename ?? `surveys-export-${Date.now()}.csv`);
}

export function exportSurveysExcel(agents: Agent[], filename?: string): void {
  const rows = agents.map(surveyToRow);
  const sheet = XLSX.utils.aoa_to_sheet([HEADERS as unknown as string[], ...rows]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Surveys");
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
