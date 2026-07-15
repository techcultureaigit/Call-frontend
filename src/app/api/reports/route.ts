import { NextResponse } from "next/server";
import {
  generateReportsData,
  getReportCampaigns,
} from "@/lib/data/reports-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaigns = searchParams.get("campaigns") === "true";

  await new Promise((r) => setTimeout(r, 350));

  if (campaigns) {
    return NextResponse.json({
      success: true,
      data: getReportCampaigns(),
    });
  }

  const data = generateReportsData({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    campaignId: searchParams.get("campaignId") ?? undefined,
  });

  return NextResponse.json({ success: true, data });
}
