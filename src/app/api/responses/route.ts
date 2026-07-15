import { NextResponse } from "next/server";
import {
  getAllFilteredResponses,
  getFilterOptions,
  getResponseStats,
  queryResponses,
} from "@/lib/data/responses-repository";
import type { ResponseStatus } from "@/types/response";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exportAll = searchParams.get("export") === "true";
  const stats = searchParams.get("stats") === "true";
  const filters = searchParams.get("filters") === "true";

  await new Promise((r) => setTimeout(r, 280));

  const baseParams = {
    search: searchParams.get("search") ?? "",
    status: (searchParams.get("status") as ResponseStatus | "all") ?? "all",
    campaignId: searchParams.get("campaignId") ?? "all",
    surveyId: searchParams.get("surveyId") ?? "all",
    sentiment:
      (searchParams.get("sentiment") as "positive" | "neutral" | "negative" | "all") ??
      "all",
    sortBy: (searchParams.get("sortBy") as "customerName") ?? "submittedAt",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
  };

  if (stats) {
    return NextResponse.json({ success: true, data: getResponseStats() });
  }

  if (filters) {
    return NextResponse.json({ success: true, data: getFilterOptions() });
  }

  if (exportAll) {
    return NextResponse.json({
      success: true,
      data: getAllFilteredResponses(baseParams),
    });
  }

  return NextResponse.json(
    queryResponses({
      ...baseParams,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 10),
    })
  );
}
