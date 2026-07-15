import { MOCK_CALLS } from "@/lib/data/mock-calls";
import type { PaginatedMeta, PaginatedResponse } from "@/types";
import type { Call, CallStatus } from "@/types/call";

let callsDB: Call[] = [...MOCK_CALLS];

export interface CallsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CallStatus | "all";
  hasRecording?: boolean;
  liveOnly?: boolean;
  sortBy?: keyof Call | "customerName";
  sortOrder?: "asc" | "desc";
}

export function queryCalls(
  params: CallsQueryParams = {}
): PaginatedResponse<Call> {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "all",
    hasRecording = false,
    liveOnly = false,
    sortBy = "startedAt",
    sortOrder = "desc",
  } = params;

  let filtered = [...callsDB];

  if (liveOnly) {
    filtered = filtered.filter((c) =>
      ["in_progress", "queued"].includes(c.status)
    );
  }

  if (hasRecording) {
    filtered = filtered.filter((c) => Boolean(c.recordingUrl));
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.customer.firstName.toLowerCase().includes(q) ||
        c.customer.lastName.toLowerCase().includes(q) ||
        c.customer.company.toLowerCase().includes(q) ||
        c.customer.phone.includes(q) ||
        c.agentName.toLowerCase().includes(q) ||
        c.campaignName?.toLowerCase().includes(q)
    );
  }

  if (status !== "all") {
    filtered = filtered.filter((c) => c.status === status);
  }

  filtered.sort((a, b) => {
    let aVal = "";
    let bVal = "";
    if (sortBy === "customerName") {
      aVal = `${a.customer.firstName} ${a.customer.lastName}`;
      bVal = `${b.customer.firstName} ${b.customer.lastName}`;
    } else {
      aVal = String(a[sortBy as keyof Call] ?? "");
      bVal = String(b[sortBy as keyof Call] ?? "");
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

export function getCallById(id: string): Call | undefined {
  return callsDB.find((c) => c.id === id);
}

export function retryCall(id: string): Call | null {
  const index = callsDB.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const call = callsDB[index];
  if (!call.canRetry) return null;

  const now = new Date().toISOString();
  const updated: Call = {
    ...call,
    status: "queued",
    retryCount: call.retryCount + 1,
    canRetry: false,
    startedAt: now,
    endedAt: undefined,
    durationSeconds: 0,
    timeline: [
      ...call.timeline,
      {
        id: `tl_retry_${Date.now()}`,
        type: "retry_scheduled",
        label: "Retry scheduled",
        description: `Attempt #${call.retryCount + 2}`,
        occurredAt: now,
      },
    ],
    updatedAt: now,
  };

  callsDB[index] = updated;
  return updated;
}

export function getCallStats() {
  const live = callsDB.filter((c) =>
    ["in_progress", "queued"].includes(c.status)
  ).length;
  const completed = callsDB.filter((c) => c.status === "completed").length;
  const failed = callsDB.filter(
    (c) => ["failed", "no_answer", "busy"].includes(c.status)
  ).length;
  const withRecording = callsDB.filter((c) => c.recordingUrl).length;

  return { live, completed, failed, withRecording, total: callsDB.length };
}
