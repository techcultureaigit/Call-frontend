import type { SurveyResponse } from "@/types/response";
import { downloadCSV } from "@/lib/utils/csv";

export function responsesToCSV(responses: SurveyResponse[]): string {
  const headers = [
    "ID",
    "Customer",
    "Company",
    "Email",
    "Campaign",
    "Survey",
    "Status",
    "Sentiment",
    "NPS Score",
    "Confidence",
    "Summary",
    "Key Topics",
    "Flags",
    "Submitted At",
  ];

  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const rows = responses.map((r) => [
    r.id,
    `${r.customer.firstName} ${r.customer.lastName}`,
    r.customer.company,
    r.customer.email,
    r.campaignName,
    r.surveyName,
    r.status,
    r.aiExtracted.sentiment,
    String(r.aiExtracted.npsScore ?? ""),
    String(r.aiExtracted.confidence),
    r.aiExtracted.summary,
    r.aiExtracted.keyTopics.join(";"),
    r.aiExtracted.flags.join(";"),
    r.submittedAt,
  ]);

  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export function exportResponsesCSV(
  responses: SurveyResponse[],
  filename?: string
) {
  const csv = responsesToCSV(responses);
  downloadCSV(csv, filename ?? `responses-export-${Date.now()}.csv`);
}
