import { NextResponse } from "next/server";
import {
  createCampaign,
  getAggregateStats,
  launchCampaign,
  pauseCampaign,
  queryCampaigns,
  resumeCampaign,
  retryFailedCalls,
  stopCampaign,
} from "@/lib/data/campaigns-repository";
import type { CampaignStatus, CampaignType } from "@/types/campaign";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const aggregate = searchParams.get("aggregate") === "true";

  await new Promise((r) => setTimeout(r, 280));

  if (aggregate) {
    return NextResponse.json({
      success: true,
      data: getAggregateStats(),
    });
  }

  return NextResponse.json(
    queryCampaigns({
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 10),
      search: searchParams.get("search") ?? "",
      status: (searchParams.get("status") as CampaignStatus | "all") ?? "all",
      type: (searchParams.get("type") as CampaignType | "all") ?? "all",
      sortBy: (searchParams.get("sortBy") as "name") ?? "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
      live: searchParams.get("live") === "true",
    })
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const campaign = createCampaign(body);
  return NextResponse.json({ success: true, data: campaign }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { action, id } = body;

  if (!id) {
    return NextResponse.json({ message: "Campaign ID required" }, { status: 400 });
  }

  let result = null;

  switch (action) {
    case "pause":
      result = pauseCampaign(id);
      break;
    case "resume":
      result = resumeCampaign(id);
      break;
    case "stop":
      result = stopCampaign(id);
      break;
    case "launch":
      result = launchCampaign(id);
      break;
    case "retry_failed":
      result = retryFailedCalls(id);
      break;
    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }

  if (!result) {
    return NextResponse.json(
      { message: "Action not allowed for current campaign state" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: result });
}
