import { NextResponse } from "next/server";
import { getCallStats, queryCalls, retryCall } from "@/lib/data/calls-repository";
import type { CallStatus } from "@/types/call";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stats = searchParams.get("stats") === "true";

  await new Promise((r) => setTimeout(r, 280));

  if (stats) {
    return NextResponse.json({ success: true, data: getCallStats() });
  }

  return NextResponse.json(
    queryCalls({
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 10),
      search: searchParams.get("search") ?? "",
      status: (searchParams.get("status") as CallStatus | "all") ?? "all",
      hasRecording: searchParams.get("hasRecording") === "true",
      liveOnly: searchParams.get("liveOnly") === "true",
      sortBy: (searchParams.get("sortBy") as "customerName") ?? "startedAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
    })
  );
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (body.action === "retry" && body.id) {
    const result = retryCall(body.id);
    if (!result) {
      return NextResponse.json(
        { message: "Call cannot be retried" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, data: result });
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}
