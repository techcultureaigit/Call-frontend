import * as XLSX from "xlsx";
import { parseCSV } from "@/lib/utils/csv";

/** Any columns from the uploaded contact spreadsheet */
export type ClientContactRow = Record<string, string>;

/** Normalize a parsed CSV/object row — keep every non-empty header as-is */
export function mapRowToClientContact(
  row: Record<string, string>
): ClientContactRow | null {
  const fields: ClientContactRow = {};
  for (const [key, value] of Object.entries(row)) {
    const header = key.replace(/^\uFEFF/, "").trim();
    if (!header) continue;
    fields[header] = String(value ?? "").trim();
  }

  if (Object.values(fields).every((value) => !value)) return null;
  return fields;
}

export function parseClientContactsFromText(text: string): ClientContactRow[] {
  return parseCSV(text)
    .map(mapRowToClientContact)
    .filter((r): r is ClientContactRow => r !== null);
}

/** Parse Excel / CSV ArrayBuffer into dynamic contact rows */
export function parseClientContactsFromBuffer(
  buffer: ArrayBuffer,
  fileHint = ""
): ClientContactRow[] {
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
    .filter((r): r is ClientContactRow => r !== null);
}

export async function parseClientContactsFromFile(
  file: File
): Promise<ClientContactRow[]> {
  const buffer = await file.arrayBuffer();
  return parseClientContactsFromBuffer(buffer, file.name);
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
 * Fetch contact file from Cloudinary (or any) URL and parse rows dynamically.
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
      return parseClientContactsFromBuffer(buffer, hint);
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
      rows?: ClientContactRow[];
      text?: string;
      contentType?: string;
    };
  };

  if (!proxy.ok || !json.success || !json.data) {
    throw new Error(json.message || "Failed to load contacts from URL");
  }

  if (Array.isArray(json.data.rows)) {
    return json.data.rows
      .map(mapRowToClientContact)
      .filter((r): r is ClientContactRow => r !== null);
  }

  // Legacy proxy shape (text only) — CSV only
  if (json.data.text) {
    return parseClientContactsFromText(json.data.text);
  }

  throw new Error("Failed to parse contacts from URL");
}

/** Collect column headers across dynamic contact rows */
export function getContactColumnKeys(rows: ClientContactRow[]): string[] {
  const keys = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (key) keys.add(key);
    }
  }
  return Array.from(keys);
}

/** Drop null / empty contact placeholders from API payloads */
export function sanitizeContactRows(
  rows: unknown[] | undefined | null
): ClientContactRow[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((row): row is Record<string, unknown> =>
      Boolean(row && typeof row === "object")
    )
    .map((row) => {
      const normalized: Record<string, string> = {};
      for (const [key, value] of Object.entries(row)) {
        normalized[key] = String(value ?? "").trim();
      }
      return mapRowToClientContact(normalized);
    })
    .filter((r): r is ClientContactRow => r !== null);
}
