import { NextResponse } from "next/server";
import { getCallById } from "@/lib/data/calls-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await new Promise((r) => setTimeout(r, 200));

  const call = getCallById(id);
  if (!call) {
    return NextResponse.json({ message: "Call not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: call });
}
