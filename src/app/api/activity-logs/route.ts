import { NextResponse } from "next/server";
import {
  getActivityLogFilterOptions,
  getActivityLogStats,
  queryActivityLogs,
} from "@/lib/data/activity-logs-repository";
import type { AuditAction, AuditModule } from "@/types/activity-log";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stats = searchParams.get("stats") === "true";
  const filters = searchParams.get("filters") === "true";

  await new Promise((r) => setTimeout(r, 220));

  if (stats) {
    return NextResponse.json({ success: true, data: getActivityLogStats() });
  }

  if (filters) {
    return NextResponse.json({
      success: true,
      data: getActivityLogFilterOptions(),
    });
  }

  return NextResponse.json(
    queryActivityLogs({
      search: searchParams.get("search") ?? "",
      action: (searchParams.get("action") as AuditAction | "all") ?? "all",
      module: (searchParams.get("module") as AuditModule | "all") ?? "all",
      actorId: searchParams.get("actorId") ?? "all",
      sortBy:
        (searchParams.get("sortBy") as
          | "occurredAt"
          | "summary"
          | "action"
          | "module") ?? "occurredAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 10),
    })
  );
}
