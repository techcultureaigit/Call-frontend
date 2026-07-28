import { parseCSV } from "@/lib/utils/csv";

export interface ClientContactRow {
  name: string;
  phone: string;
  email: string;
  company: string;
}

const COLUMN_ALIASES: Record<keyof ClientContactRow, string[]> = {
  name: ["name", "full_name", "fullname", "contact_name", "client_name"],
  phone: ["phone", "mobile", "phone_number", "mobile_number", "contact"],
  email: ["email", "email_address", "mail"],
  company: ["company", "organization", "org", "business"],
};

function pickField(
  row: Record<string, string>,
  keys: string[]
): string {
  for (const key of keys) {
    const value = row[key];
    if (value != null && String(value).trim()) return String(value).trim();
  }
  return "";
}

/** Normalize a parsed CSV/object row into name/phone/email/company */
export function mapRowToClientContact(
  row: Record<string, string>
): ClientContactRow | null {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[key.toLowerCase().replace(/\s+/g, "_")] = String(value ?? "").trim();
  }

  const contact: ClientContactRow = {
    name: pickField(normalized, COLUMN_ALIASES.name),
    phone: pickField(normalized, COLUMN_ALIASES.phone),
    email: pickField(normalized, COLUMN_ALIASES.email),
    company: pickField(normalized, COLUMN_ALIASES.company),
  };

  // Keep row if at least name or phone or email is present
  if (!contact.name && !contact.phone && !contact.email) return null;
  return contact;
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

  // Prefer text CSV path; Excel binary without a library falls back to text decode
  if (lower.endsWith(".csv") || file.type.includes("csv") || file.type.includes("text")) {
    const text = new TextDecoder().decode(buffer);
    return parseClientContactsFromText(text);
  }

  // Try decoding as text (some .xls exports are CSV misnamed)
  const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  if (text.includes(",") && /name/i.test(text.split(/\r?\n/)[0] ?? "")) {
    return parseClientContactsFromText(text);
  }

  throw new Error(
    "Could not read contacts. Please upload a CSV with columns: name, phone, email, company"
  );
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
