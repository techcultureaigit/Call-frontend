import type { Customer } from "@/types/customer";

export function customersToCSV(customers: Customer[]): string {
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Company",
    "Job Title",
    "Status",
    "Tier",
    "Source",
    "Owner",
    "LTV",
    "City",
    "Country",
    "Tags",
    "Last Contact",
    "Created At",
  ];

  const rows = customers.map((c) => [
    c.firstName,
    c.lastName,
    c.email,
    c.phone ?? "",
    c.company,
    c.jobTitle ?? "",
    c.status,
    c.tier,
    c.source,
    c.ownerName,
    String(c.lifetimeValue),
    c.city ?? "",
    c.country ?? "",
    c.tags.join(";"),
    c.lastContactAt ?? "",
    c.createdAt,
  ]);

  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/\s+/g, "_")
  );

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? "";
    });
    return row;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function mapCSVRowToCustomer(
  row: Record<string, string>
): {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  jobTitle?: string;
  status?: Customer["status"];
  tier?: Customer["tier"];
} | null {
  const firstName =
    row.first_name ?? row.firstname ?? "";
  const lastName = row.last_name ?? row.lastname ?? "";
  const email = row.email ?? "";
  const company = row.company ?? row.organization ?? "";

  if (!email || !firstName || !company) return null;

  return {
    firstName,
    lastName,
    email,
    phone: row.phone || undefined,
    company,
    jobTitle: row.job_title ?? row.jobtitle ?? undefined,
    status: (row.status as Customer["status"]) || undefined,
    tier: (row.tier as Customer["tier"]) || undefined,
  };
}

export async function parseImportFile(
  file: File
): Promise<ReturnType<typeof mapCSVRowToCustomer>[]> {
  const buffer = await file.arrayBuffer();
  const isExcel =
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls") ||
    file.type.includes("spreadsheet");

  let rows: Record<string, string>[];

  if (isExcel && !file.name.endsWith(".csv")) {
    rows = parseExcelBuffer(buffer);
  } else {
    const text = new TextDecoder().decode(buffer);
    rows = parseCSV(text);
  }

  return rows
    .map(mapCSVRowToCustomer)
    .filter((r): r is NonNullable<typeof r> => r !== null);
}

function parseExcelBuffer(buffer: ArrayBuffer): Record<string, string>[] {
  const bytes = new Uint8Array(buffer);
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b;

  if (!isZip) {
    const text = new TextDecoder().decode(buffer);
    return parseCSV(text);
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  const strings = (text.match(/<t[^>]*>([^<]*)<\/t>/g) ?? [])
    .map((m) => m.replace(/<[^>]+>/g, "").trim())
    .filter((s) => s.length > 0);

  const rows: Record<string, string>[] = [];
  const emails = strings.filter((s) => s.includes("@"));

  emails.forEach((email, idx) => {
    const emailIdx = strings.indexOf(email);
    rows.push({
      first_name: strings[emailIdx - 2] ?? `Imported${idx + 1}`,
      last_name: strings[emailIdx - 1] ?? "",
      email,
      company: strings[emailIdx + 1] ?? "Imported Company",
      phone: strings[emailIdx + 2] ?? "",
    });
  });

  return rows;
}
