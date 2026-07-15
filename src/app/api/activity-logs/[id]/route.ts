import { NextResponse } from "next/server";
import { getActivityLogById } from "@/lib/data/activity-logs-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await new Promise((r) => setTimeout(r, 150));

  const log = getActivityLogById(id);
  if (!log) {
    return NextResponse.json(
      { message: "Activity log not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: log });
}
