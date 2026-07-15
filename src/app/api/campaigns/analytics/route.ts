import { NextResponse } from "next/server";
import { generateCampaignAnalytics } from "@/lib/data/campaign-analytics-repository";
import type { CampaignAnalyticsQueryParams } from "@/types/campaign-analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  await new Promise((r) => setTimeout(r, 320));

  const params: CampaignAnalyticsQueryParams = {
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    campaignId: searchParams.get("campaignId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    language: searchParams.get("language") ?? undefined,
    surveyId: searchParams.get("surveyId") ?? undefined,
    createdBy: searchParams.get("createdBy") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    comparePeriod: searchParams.get("comparePeriod") === "true",
    search: searchParams.get("search") ?? undefined,
    page: searchParams.get("page")
      ? Number(searchParams.get("page"))
      : undefined,
    limit: searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder:
      (searchParams.get("sortOrder") as "asc" | "desc") ?? undefined,
  };

  const data = generateCampaignAnalytics(params);
  return NextResponse.json({ success: true, data });
}
