import { NextResponse } from "next/server";
import { getResponseById } from "@/lib/data/responses-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await new Promise((r) => setTimeout(r, 200));

  const response = getResponseById(id);
  if (!response) {
    return NextResponse.json({ message: "Response not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: response });
}
