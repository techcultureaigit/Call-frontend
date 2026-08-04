import * as XLSX from "xlsx";
import { parseCSV } from "@/lib/utils/csv";

/** Contact row — only `contact` (phone number) */
export type ClientContactRow = { contact: string };

export const CONTACT_COLUMN = "contact";

/** Digits only, 10–15 length (Indian mobiles + optional country code) */
export function isValidContactNumber(value: string): boolean {
  const digits = String(value ?? "").replace(/\D/g, "");
  return /^\d{10,15}$/.test(digits);
}

export function normalizeContactNumber(value: string): string {
  return String(value ?? "").replace(/\D/g, "");
}

export type ContactValidationResult =
  | { ok: true; contacts: ClientContactRow[] }
  | { ok: false; errors: string[] };

/**
 * Validate spreadsheet rows: exactly one `contact` column, numbers only.
 */
export function validateContactRows(
  rows: Record<string, string>[]
): ContactValidationResult {
  const errors: string[] = [];

  if (!rows.length) {
    return {
      ok: false,
      errors: ["File is empty. Add at least one contact number."],
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
  const contactHeader = headers.find(
    (h) => h.toLowerCase() === CONTACT_COLUMN
  );

  if (!contactHeader) {
    return {
      ok: false,
      errors: [
        `Missing required column "${CONTACT_COLUMN}". Your file has: ${
          headers.length ? headers.join(", ") : "(no headers)"
        }.`,
        `Download the sample CSV and keep only one column named "${CONTACT_COLUMN}".`,
      ],
    };
  }

  const extra = headers.filter((h) => h.toLowerCase() !== CONTACT_COLUMN);
  if (extra.length > 0) {
    return {
      ok: false,
      errors: [
        `Only the "${CONTACT_COLUMN}" column is allowed. Remove: ${extra.join(", ")}.`,
        "Sample format: one header row with contact, then phone numbers in each row.",
      ],
    };
  }

  const contacts: ClientContactRow[] = [];
  const seen = new Set<string>();

  rows.forEach((row, index) => {
    const line = index + 2; // header is line 1
    const raw = String(row[contactHeader] ?? "").trim();

    if (!raw) {
      errors.push(`Row ${line}: empty — enter a phone number.`);
      return;
    }

    if (/[^\d\s+\-()]/.test(raw)) {
      errors.push(
        `Row ${line}: "${raw}" is invalid — only numbers are allowed in ${CONTACT_COLUMN}.`
      );
      return;
    }

    if (!isValidContactNumber(raw)) {
      errors.push(
        `Row ${line}: "${raw}" is not a valid number (use 10–15 digits only).`
      );
      return;
    }

    const contact = normalizeContactNumber(raw);
    if (seen.has(contact)) {
      errors.push(`Row ${line}: duplicate number ${contact}.`);
      return;
    }
    seen.add(contact);
    contacts.push({ contact });
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (contacts.length === 0) {
    return {
      ok: false,
      errors: ["No valid contact numbers found in the file."],
    };
  }

  return { ok: true, contacts };
}

/** Normalize a parsed CSV/object row — keep headers trimmed */
export function mapRowToClientContact(
  row: Record<string, string>
): Record<string, string> | null {
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const header = key.replace(/^\uFEFF/, "").trim();
    if (!header) continue;
    fields[header] = String(value ?? "").trim();
  }

  if (Object.values(fields).every((value) => !value)) return null;
  return fields;
}

export function parseClientContactsFromText(
  text: string
): Record<string, string>[] {
  return parseCSV(text)
    .map(mapRowToClientContact)
    .filter((r): r is Record<string, string> => r !== null);
}

/** Parse Excel / CSV ArrayBuffer into raw rows (before validation) */
export function parseClientContactsFromBuffer(
  buffer: ArrayBuffer,
  fileHint = ""
): Record<string, string>[] {
  const lower = fileHint.toLowerCase();
  const bytes = new Uint8Array(buffer);
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b; // PK — xlsx/zip
  const looksCsv =
    lower.endsWith(".csv") ||
    (!isZip && !lower.endsWith(".xlsx") && !lower.endsWith(".xls"));

  if (looksCsv && !isZip) {
    const text = new TextDecoder().decode(buffer);
    return parseClientContactsFromText(text);
  }

  const book = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = book.SheetNames[0];
  if (!sheetName) return [];

  const sheet = book.Sheets[sheetName];
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  return jsonRows
    .map((row) => {
      const normalized: Record<string, string> = {};
      for (const [key, value] of Object.entries(row)) {
        normalized[key] = String(value ?? "").trim();
      }
      return mapRowToClientContact(normalized);
    })
    .filter((r): r is Record<string, string> => r !== null);
}

export async function parseClientContactsFromFile(
  file: File
): Promise<Record<string, string>[]> {
  const buffer = await file.arrayBuffer();
  return parseClientContactsFromBuffer(buffer, file.name);
}

/** Parse + validate file; only correct `contact` numbers pass */
export async function parseAndValidateClientContactsFile(
  file: File
): Promise<ContactValidationResult> {
  const rows = await parseClientContactsFromFile(file);
  return validateContactRows(rows);
}

function fileHintFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith(".csv")) return ".csv";
    if (pathname.endsWith(".xlsx")) return ".xlsx";
    if (pathname.endsWith(".xls")) return ".xls";
  } catch {
    // ignore
  }
  return url.toLowerCase();
}

/**
 * Fetch contact file from Cloudinary (or any) URL and parse rows.
 * Tries direct fetch first, then Next.js proxy if CORS blocks.
 */
export async function fetchClientContactsFromUrl(
  url: string
): Promise<ClientContactRow[]> {
  const hint = fileHintFromUrl(url);

  try {
    const res = await fetch(url, { mode: "cors" });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const raw = parseClientContactsFromBuffer(buffer, hint);
      const result = validateContactRows(raw);
      if (result.ok) return result.contacts;
      return softMapLegacyContacts(raw);
    }
  } catch {
    // Fall through to proxy
  }

  const proxy = await fetch(
    `/api/survey/contacts?url=${encodeURIComponent(url)}`
  );
  const json = (await proxy.json()) as {
    success: boolean;
    message?: string;
    data?: {
      rows?: Record<string, string>[];
      text?: string;
      contentType?: string;
    };
  };

  if (!proxy.ok || !json.success || !json.data) {
    throw new Error(json.message || "Failed to load contacts from URL");
  }

  if (Array.isArray(json.data.rows)) {
    const raw = json.data.rows
      .map(mapRowToClientContact)
      .filter((r): r is Record<string, string> => r !== null);
    const result = validateContactRows(raw);
    if (result.ok) return result.contacts;
    return softMapLegacyContacts(raw);
  }

  if (json.data.text) {
    const raw = parseClientContactsFromText(json.data.text);
    const result = validateContactRows(raw);
    if (result.ok) return result.contacts;
    return softMapLegacyContacts(raw);
  }

  throw new Error("Failed to parse contacts from URL");
}

/** Best-effort for old uploads that used NUMBERS / phone / etc. */
function softMapLegacyContacts(
  rows: Record<string, string>[]
): ClientContactRow[] {
  const out: ClientContactRow[] = [];
  for (const row of rows) {
    const entries = Object.entries(row);
    const preferred =
      entries.find(([k]) =>
        /^(contact|phone|mobile|number|numbers)$/i.test(k.trim())
      ) ?? entries.find(([, v]) => isValidContactNumber(String(v)));
    if (!preferred) continue;
    const contact = normalizeContactNumber(preferred[1]);
    if (isValidContactNumber(contact)) out.push({ contact });
  }
  return out;
}

/** Collect column headers across contact rows */
export function getContactColumnKeys(rows: ClientContactRow[]): string[] {
  if (rows.length === 0) return [];
  return [CONTACT_COLUMN];
}

/** Drop null / empty contact placeholders from API payloads */
export function sanitizeContactRows(
  rows: unknown[] | undefined | null
): ClientContactRow[] {
  if (!Array.isArray(rows)) return [];
  const out: ClientContactRow[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    const raw =
      record.contact ??
      record.phone ??
      record.mobile ??
      record.number ??
      record.NUMBERS ??
      Object.values(record).find((v) => isValidContactNumber(String(v ?? "")));
    if (raw == null) continue;
    const contact = normalizeContactNumber(String(raw));
    if (isValidContactNumber(contact)) out.push({ contact });
  }
  return out;
}
