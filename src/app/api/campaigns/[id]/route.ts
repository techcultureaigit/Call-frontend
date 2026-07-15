import { NextResponse } from "next/server";
import {
  deleteCampaign,
  getCampaignById,
  getCampaignStats,
} from "@/lib/data/campaigns-repository";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const statsOnly = searchParams.get("stats") === "true";
  const live = searchParams.get("live") === "true";

  await new Promise((r) => setTimeout(r, 200));

  if (statsOnly) {
    const stats = getCampaignStats(id);
    if (!stats) {
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: stats });
  }

  const campaign = getCampaignById(id, live);
  if (!campaign) {
    return NextResponse.json({ message: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: campaign });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteCampaign(id);
  if (!deleted) {
    return NextResponse.json({ message: "Campaign not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
