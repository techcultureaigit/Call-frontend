/**
 * survey-upload.ts
 * Parse and validate survey questions file — client-side only, no API.
 * Upload handled in survey-tabs.tsx:
 *   uploadSurveyQuestionsFile() → POST /api/surveys/:id/questions-file
 */
import * as XLSX from "xlsx";
import { downloadCSV, parseCSV } from "@/lib/utils/csv";
import type { AgentSurveyQuestion as SurveyQuestion, AgentSurveyQuestionOption as SurveyQuestionOption } from "@/types/agent";

/* ========== upload ========== */

export const ALLOWED_QUESTION_TYPES = [
  "text",
  "yes_no",
  "rating",
  "multi",
] as const;

export type AllowedQuestionType = (typeof ALLOWED_QUESTION_TYPES)[number];

export type QuestionValidationResult =
  | { ok: true; questions: SurveyQuestion[] }
  | { ok: false; errors: string[] };

function makeOption(label: string, index = 0): SurveyQuestionOption {
  const trimmed = label.trim();
  return {
    id: `opt-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    label: trimmed,
    value: trimmed.toLowerCase().replace(/\s+/g, "_"),
  };
}

function parseOptionsPipe(raw: string): SurveyQuestionOption[] {
  return raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((label, i) => makeOption(label, i));
}

function normalizeType(raw: string): AllowedQuestionType | null {
  const t = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (t === "multiple_choice" || t === "multiple-choice") return "multi";
  if ((ALLOWED_QUESTION_TYPES as readonly string[]).includes(t)) {
    return t as AllowedQuestionType;
  }
  return null;
}

function mapRawRow(row: Record<string, unknown>): Record<string, string> | null {
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const header = key.replace(/^\uFEFF/, "").trim();
    if (!header) continue;
    fields[header] = String(value ?? "").trim();
  }
  if (Object.values(fields).every((v) => !v)) return null;
  return fields;
}

export function parseSurveyQuestionsFromText(
  text: string
): Record<string, string>[] {
  return parseCSV(text)
    .map(mapRawRow)
    .filter((r): r is Record<string, string> => r !== null);
}

export function parseSurveyQuestionsFromBuffer(
  buffer: ArrayBuffer,
  fileHint = ""
): Record<string, string>[] {
  const lower = fileHint.toLowerCase();
  const bytes = new Uint8Array(buffer);
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b;
  const looksCsv =
    lower.endsWith(".csv") ||
    (!isZip && !lower.endsWith(".xlsx") && !lower.endsWith(".xls"));

  if (looksCsv && !isZip) {
    return parseSurveyQuestionsFromText(new TextDecoder().decode(buffer));
  }

  const book = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = book.SheetNames[0];
  if (!sheetName) return [];

  const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    book.Sheets[sheetName],
    { defval: "", raw: false }
  );

  return jsonRows
    .map(mapRawRow)
    .filter((r): r is Record<string, string> => r !== null);
}

export async function parseSurveyQuestionsFromFile(
  file: File
): Promise<Record<string, string>[]> {
  return parseSurveyQuestionsFromBuffer(await file.arrayBuffer(), file.name);
}

/**
 * Accept only columns: question, type, options.
 * Validate types and multi options.
 */
export function validateSurveyQuestionRows(
  rows: Record<string, string>[]
): QuestionValidationResult {
  const errors: string[] = [];

  if (!rows.length) {
    return {
      ok: false,
      errors: ["File is empty. Add at least one question row."],
    };
  }

  const headerKeys = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      const h = key.replace(/^\uFEFF/, "").trim();
      if (h) headerKeys.add(h);
    }
  }

  const headers = Array.from(headerKeys);
  const lowerMap = new Map(
    headers.map((h) => [h.toLowerCase().replace(/\s+/g, "_"), h] as const)
  );

  const questionHeader = lowerMap.get("question");
  const typeHeader = lowerMap.get("type");
  const optionsHeader = lowerMap.get("options");

  if (!questionHeader || !typeHeader) {
    const missing = [
      !questionHeader ? "question" : null,
      !typeHeader ? "type" : null,
    ].filter(Boolean);
    return {
      ok: false,
      errors: [
        `Missing required column(s): ${missing.join(", ")}.`,
        `Allowed columns only: question, type, options. Your file has: ${
          headers.length ? headers.join(", ") : "(no headers)"
        }.`,
        "Download the sample CSV and keep the same column names.",
      ],
    };
  }

  const allowed = new Set(["question", "type", "options"]);
  const extra = headers.filter(
    (h) => !allowed.has(h.toLowerCase().replace(/\s+/g, "_"))
  );
  if (extra.length > 0) {
    return {
      ok: false,
      errors: [
        `Only columns question, type, options are allowed. Remove: ${extra.join(", ")}.`,
        "For multiple-choice options, keep them in one cell under options, separated by | (example: A | B | C).",
      ],
    };
  }

  const questions: SurveyQuestion[] = [];

  rows.forEach((row, index) => {
    const line = index + 2;
    const question = String(row[questionHeader] ?? "").trim();
    const typeRaw = String(row[typeHeader] ?? "").trim();
    const optionsRaw = optionsHeader
      ? String(row[optionsHeader] ?? "").trim()
      : "";

    if (!question) {
      errors.push(`Row ${line}: question is empty.`);
      return;
    }

    if (!typeRaw) {
      errors.push(
        `Row ${line}: type is empty. Use text, yes_no, rating, or multi.`
      );
      return;
    }

    const type = normalizeType(typeRaw);
    if (!type) {
      errors.push(
        `Row ${line}: invalid type "${typeRaw}". Allowed: text, yes_no, rating, multi.`
      );
      return;
    }

    if (type === "multi") {
      const options = parseOptionsPipe(optionsRaw);
      if (options.length < 2) {
        errors.push(
          `Row ${line}: multi type needs at least 2 options in the options column, separated by | (e.g. Yes | No | Maybe).`
        );
        return;
      }
      questions.push({
        id: `sq-upload-${Date.now()}-${index}`,
        question,
        type,
        options,
      });
      return;
    }

    if (optionsRaw) {
      errors.push(
        `Row ${line}: type "${type}" should leave options empty (options are only for multi).`
      );
      return;
    }

    questions.push({
      id: `sq-upload-${Date.now()}-${index}`,
      question,
      type,
    });
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (questions.length === 0) {
    return {
      ok: false,
      errors: ["No valid question rows found in the file."],
    };
  }

  return { ok: true, questions };
}

export async function parseAndValidateSurveyQuestionsFile(
  file: File
): Promise<QuestionValidationResult> {
  const rows = await parseSurveyQuestionsFromFile(file);
  return validateSurveyQuestionRows(rows);
}

/** Sample CSV for Survey Questions upload */
export const SURVEY_QUESTIONS_SAMPLE_CSV = [
  "question,type,options",
  '"How satisfied are you with our service?",text,',
  '"Would you recommend us to a friend?",yes_no,',
  '"Rate your overall experience from 1 to 5",rating,',
  '"Which feature do you use most?",multi,"Dashboard | Reports | Calls | Support"',
  '"Any additional feedback for us?",text,',
].join("\n");

/** Sample CSV for Contact of Client — one column `contact` */
export const CLIENT_CONTACTS_SAMPLE_CSV = [
  "contact",
  "9876543210",
  "9123456780",
  "9988776655",
  "9012345678",
].join("\n");

export function downloadSurveyQuestionsSample() {
  downloadCSV(SURVEY_QUESTIONS_SAMPLE_CSV, "sample-survey-questions.csv");
}

export function downloadClientContactsSample() {
  downloadCSV(CLIENT_CONTACTS_SAMPLE_CSV, "sample-client-contacts.csv");
}