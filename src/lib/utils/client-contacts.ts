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

export async function parseClientContactsFromFile(
  file: File
): Promise<ClientContactRow[]> {
  const lower = file.name.toLowerCase();
  const buffer = await file.arrayBuffer();

  if (lower.endsWith(".csv") || file.type.includes("csv") || file.type.includes("text")) {
    const text = new TextDecoder().decode(buffer);
    return parseClientContactsFromText(text);
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  if (text.includes(",")) {
    return parseClientContactsFromText(text);
  }

  throw new Error("Could not read contacts. Please upload a CSV or Excel file.");
}

/**
 * Fetch contact file from Cloudinary (or any) URL and parse rows dynamically.
 * Tries direct fetch first, then Next.js proxy if CORS blocks.
 */
export async function fetchClientContactsFromUrl(
  url: string
): Promise<ClientContactRow[]> {
  const tryParseBuffer = async (buffer: ArrayBuffer, contentType: string) => {
    if (
      contentType.includes("csv") ||
      contentType.includes("text") ||
      url.toLowerCase().includes(".csv")
    ) {
      const text = new TextDecoder().decode(buffer);
      return parseClientContactsFromText(text);
    }

    const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    if (text.includes(",")) {
      return parseClientContactsFromText(text);
    }

    throw new Error("Unsupported contact file format from URL");
  };

  try {
    const res = await fetch(url, { mode: "cors" });
    if (res.ok) {
      const contentType = (res.headers.get("content-type") || "").toLowerCase();
      const buffer = await res.arrayBuffer();
      return tryParseBuffer(buffer, contentType);
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
    data?: { text: string; contentType: string };
  };

  if (!proxy.ok || !json.success || !json.data?.text) {
    throw new Error(json.message || "Failed to load contacts from URL");
  }

  return parseClientContactsFromText(json.data.text);
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
