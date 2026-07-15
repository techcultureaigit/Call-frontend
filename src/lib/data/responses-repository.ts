import { MOCK_RESPONSES } from "@/lib/data/mock-responses";
import type { PaginatedMeta, PaginatedResponse } from "@/types";
import type { ResponseStatus, SurveyResponse } from "@/types/response";

let responsesDB: SurveyResponse[] = [...MOCK_RESPONSES];

export interface ResponsesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ResponseStatus | "all";
  campaignId?: string | "all";
  surveyId?: string | "all";
  sentiment?: "positive" | "neutral" | "negative" | "all";
  sortBy?: keyof SurveyResponse | "customerName";
  sortOrder?: "asc" | "desc";
}

export function queryResponses(
  params: ResponsesQueryParams = {}
): PaginatedResponse<SurveyResponse> {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "all",
    campaignId = "all",
    surveyId = "all",
    sentiment = "all",
    sortBy = "submittedAt",
    sortOrder = "desc",
  } = params;

  let filtered = [...responsesDB];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.customer.firstName.toLowerCase().includes(q) ||
        r.customer.lastName.toLowerCase().includes(q) ||
        r.customer.company.toLowerCase().includes(q) ||
        r.customer.email.toLowerCase().includes(q) ||
        r.campaignName.toLowerCase().includes(q) ||
        r.surveyName.toLowerCase().includes(q) ||
        r.aiExtracted.summary.toLowerCase().includes(q) ||
        r.aiExtracted.keyTopics.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (status !== "all") filtered = filtered.filter((r) => r.status === status);
  if (campaignId !== "all")
    filtered = filtered.filter((r) => r.campaignId === campaignId);
  if (surveyId !== "all")
    filtered = filtered.filter((r) => r.surveyId === surveyId);
  if (sentiment !== "all")
    filtered = filtered.filter((r) => r.aiExtracted.sentiment === sentiment);

  filtered.sort((a, b) => {
    let aVal = "";
    let bVal = "";
    if (sortBy === "customerName") {
      aVal = `${a.customer.firstName} ${a.customer.lastName}`;
      bVal = `${b.customer.firstName} ${b.customer.lastName}`;
    } else {
      aVal = String(a[sortBy as keyof SurveyResponse] ?? "");
      bVal = String(b[sortBy as keyof SurveyResponse] ?? "");
    }
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  const meta: PaginatedMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { data: filtered.slice(start, start + limit), meta };
}

export function getAllFilteredResponses(
  params: Omit<ResponsesQueryParams, "page" | "limit">
): SurveyResponse[] {
  return queryResponses({ ...params, page: 1, limit: 10000 }).data;
}

export function getResponseById(id: string): SurveyResponse | undefined {
  return responsesDB.find((r) => r.id === id);
}

export function getResponseStats() {
  return {
    total: responsesDB.length,
    pending: responsesDB.filter((r) => r.status === "pending_review").length,
    flagged: responsesDB.filter((r) => r.status === "flagged").length,
    completed: responsesDB.filter((r) => r.status === "completed").length,
    positive: responsesDB.filter((r) => r.aiExtracted.sentiment === "positive")
      .length,
  };
}

export function getFilterOptions() {
  const campaigns = new Map<string, string>();
  const surveys = new Map<string, string>();
  responsesDB.forEach((r) => {
    campaigns.set(r.campaignId, r.campaignName);
    surveys.set(r.surveyId, r.surveyName);
  });
  return {
    campaigns: Array.from(campaigns.entries()).map(([id, name]) => ({
      id,
      name,
    })),
    surveys: Array.from(surveys.entries()).map(([id, name]) => ({ id, name })),
  };
}
