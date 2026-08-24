/**
 * survey-upload.ts
 * Parse and validate survey questions file — client-side only, no API.
 * Upload handled in survey-tabs.tsx:
 *   uploadSurveyQuestionsFile() → POST /api/surveys/:id/questions-file
 *
 * Columns:
 *   question, type, options, instruction (required headers: question, type)
 *   parent_question, if_answer (optional — conditional follow-ups)
 */
import * as XLSX from "xlsx";
import { downloadCSV, parseCSV } from "@/lib/utils/csv";
import type {
  AgentSurveyQuestion as SurveyQuestion,
  AgentSurveyQuestionCondition as SurveyQuestionCondition,
  AgentSurveyQuestionOption as SurveyQuestionOption,
  AgentSurveyThenShowQuestion as SurveyThenShowQuestion,
} from "@/types/agent";

/* ========== upload ========== */

export const ALLOWED_QUESTION_TYPES = [
  "text",
  "long",
  "yes_no",
  "rating",
  "number",
  "multi",
] as const;

export type AllowedQuestionType = (typeof ALLOWED_QUESTION_TYPES)[number];

export type QuestionValidationResult =
  | { ok: true; questions: SurveyQuestion[] }
  | { ok: false; errors: string[] };

const ALLOWED_HEADERS = new Set([
  "question",
  "type",
  "options",
  "instruction",
  "description",
  "parent_question",
  "if_answer",
]);

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

function createQuestionId(prefix: string, index: number) {
  return `${prefix}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeType(raw: string): AllowedQuestionType | null {
  const t = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (t === "multiple_choice" || t === "multiple-choice") return "multi";
  if (t === "numeric" || t === "integer" || t === "int" || t === "num") {
    return "number";
  }
  if (
    t === "description" ||
    t === "long_text" ||
    t === "longtext" ||
    t === "paragraph" ||
    t === "desc"
  ) {
    return "long";
  }
  if ((ALLOWED_QUESTION_TYPES as readonly string[]).includes(t)) {
    return t as AllowedQuestionType;
  }
  return null;
}

function normalizeQuestionKey(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
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

type ParsedUploadRow = {
  line: number;
  question: string;
  type: AllowedQuestionType;
  instruction: string;
  options: SurveyQuestionOption[];
  parentQuestion: string;
  ifAnswer: string;
};

/**
 * Accept columns: question, type, options, instruction,
 * plus optional parent_question + if_answer for conditional follow-ups.
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
  const instructionHeader =
    lowerMap.get("instruction") || lowerMap.get("description");
  const parentHeader = lowerMap.get("parent_question");
  const ifAnswerHeader = lowerMap.get("if_answer");

  if (!questionHeader || !typeHeader) {
    const missing = [
      !questionHeader ? "question" : null,
      !typeHeader ? "type" : null,
    ].filter(Boolean);
    return {
      ok: false,
      errors: [
        `Missing required column(s): ${missing.join(", ")}.`,
        `Allowed columns: question, type, options, instruction, parent_question, if_answer. Your file has: ${
          headers.length ? headers.join(", ") : "(no headers)"
        }.`,
        "Download the sample CSV and keep the same column names.",
      ],
    };
  }

  const extra = headers.filter(
    (h) => !ALLOWED_HEADERS.has(h.toLowerCase().replace(/\s+/g, "_"))
  );
  if (extra.length > 0) {
    return {
      ok: false,
      errors: [
        `Only columns question, type, options, instruction, parent_question, if_answer are allowed. Remove: ${extra.join(", ")}.`,
        "For multiple-choice options, keep them in one cell under options, separated by | (example: A | B | C).",
        "For conditions, put the follow-up on its own row with parent_question + if_answer.",
      ],
    };
  }

  const parsed: ParsedUploadRow[] = [];

  rows.forEach((row, index) => {
    const line = index + 2;
    const question = String(row[questionHeader] ?? "").trim();
    const typeRaw = String(row[typeHeader] ?? "").trim();
    const optionsRaw = optionsHeader
      ? String(row[optionsHeader] ?? "").trim()
      : "";
    const instruction = instructionHeader
      ? String(row[instructionHeader] ?? "").trim()
      : "";
    const parentQuestion = parentHeader
      ? String(row[parentHeader] ?? "").trim()
      : "";
    const ifAnswer = ifAnswerHeader
      ? String(row[ifAnswerHeader] ?? "").trim()
      : "";

    if (!question) {
      errors.push(`Row ${line}: question is empty.`);
      return;
    }

    if (!typeRaw) {
      errors.push(
        `Row ${line}: type is empty. Use text, long, yes_no, rating, number, or multi.`
      );
      return;
    }

    const type = normalizeType(typeRaw);
    if (!type) {
      errors.push(
        `Row ${line}: invalid type "${typeRaw}". Allowed: text, long, yes_no, rating, number, multi.`
      );
      return;
    }

    if (parentQuestion && !ifAnswer) {
      errors.push(
        `Row ${line}: if_answer is required when parent_question is set (conditional follow-up).`
      );
      return;
    }
    if (ifAnswer && !parentQuestion) {
      errors.push(
        `Row ${line}: parent_question is required when if_answer is set.`
      );
      return;
    }

    let options: SurveyQuestionOption[] = [];
    if (type === "multi") {
      options = parseOptionsPipe(optionsRaw);
      if (options.length < 2) {
        errors.push(
          `Row ${line}: multi type needs at least 2 options in the options column, separated by | (e.g. Yes | No | Maybe).`
        );
        return;
      }
    } else if (optionsRaw) {
      errors.push(
        `Row ${line}: type "${type}" should leave options empty (options are only for multi).`
      );
      return;
    }

    parsed.push({
      line,
      question,
      type,
      instruction,
      options,
      parentQuestion,
      ifAnswer,
    });
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const seenKeys = new Map<string, number>();
  for (const row of parsed) {
    const key = normalizeQuestionKey(row.question);
    if (seenKeys.has(key)) {
      errors.push(
        `Row ${row.line}: duplicate question "${row.question}" (also on row ${seenKeys.get(key)}). Nested and normal questions must all be unique.`
      );
      continue;
    }
    seenKeys.set(key, row.line);
  }

  const topLevelRows = parsed.filter((r) => !r.parentQuestion);
  const nestedRows = parsed.filter((r) => r.parentQuestion);

  if (topLevelRows.length === 0) {
    errors.push(
      "At least one top-level question is required (leave parent_question empty)."
    );
  }

  const parentByKey = new Map(
    topLevelRows.map((r) => [normalizeQuestionKey(r.question), r] as const)
  );

  for (const row of nestedRows) {
    const parentKey = normalizeQuestionKey(row.parentQuestion);
    if (!parentByKey.has(parentKey)) {
      errors.push(
        `Row ${row.line}: parent_question "${row.parentQuestion}" was not found as a top-level question. Parent text must match exactly.`
      );
    }
    if (normalizeQuestionKey(row.question) === parentKey) {
      errors.push(
        `Row ${row.line}: follow-up question cannot be the same as its parent_question.`
      );
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const questions: SurveyQuestion[] = topLevelRows.map((row, index) => {
    const base: SurveyQuestion = {
      id: createQuestionId("sq-upload", index),
      question: row.question,
      type: row.type,
      instruction: row.instruction,
      options: row.options,
      conditions: [],
    };
    return base;
  });

  const questionByKey = new Map(
    questions.map((q) => [normalizeQuestionKey(String(q.question || "")), q])
  );

  nestedRows.forEach((row, nestedIndex) => {
    const parent = questionByKey.get(normalizeQuestionKey(row.parentQuestion));
    if (!parent) return;

    const followUp: SurveyThenShowQuestion = {
      id: createQuestionId("sq-upload-nested", nestedIndex),
      type: row.type,
      question: row.question,
      instruction: row.instruction,
      ...(row.type === "multi" ? { options: row.options } : { options: [] }),
    };

    const conditions = Array.isArray(parent.conditions)
      ? [...parent.conditions]
      : [];
    const existing = conditions.find(
      (c) =>
        normalizeQuestionKey(c.ifAnswer) === normalizeQuestionKey(row.ifAnswer)
    );

    if (existing) {
      existing.thenShowQuestions = [
        ...(existing.thenShowQuestions || []),
        followUp,
      ];
    } else {
      const next: SurveyQuestionCondition = {
        ifAnswer: row.ifAnswer,
        thenShowQuestions: [followUp],
      };
      conditions.push(next);
    }
    parent.conditions = conditions;
  });

  return { ok: true, questions };
}

export async function parseAndValidateSurveyQuestionsFile(
  file: File
): Promise<QuestionValidationResult> {
  const rows = await parseSurveyQuestionsFromFile(file);
  return validateSurveyQuestionRows(rows);
}

/** Sample CSV for Survey Questions upload (includes conditional follow-ups) */
export const SURVEY_QUESTIONS_SAMPLE_CSV = [
  "question,type,options,instruction,parent_question,if_answer",
  '"How satisfied are you with our service?",text,,"Ask them to answer in their own words",,',
  '"Would you recommend us to a friend?",yes_no,,"Accept yes or no only",,',
  '"What did you like most?",text,,"Collect one short reason","Would you recommend us to a friend?",Yes',
  '"What should we improve?",text,,"Collect one short improvement","Would you recommend us to a friend?",No',
  '"Rate your overall experience from 1 to 5",rating,,"Collect a score from 1 to 5",,',
  '"How many people live in your household?",number,,"Collect a whole number only",,',
  '"Please describe your experience in detail",long,,"Collect a detailed spoken description",,',
  '"Which feature do you use most?",multi,"Dashboard | Reports | Calls | Support","Read the options clearly",,',
  '"Any additional feedback for us?",text,,"Optional — skip if they have none",,',
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
