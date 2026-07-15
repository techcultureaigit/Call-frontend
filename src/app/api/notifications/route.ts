import { NextResponse } from "next/server";
import {
  getBellFeed,
  getNotificationStats,
  markAllNotificationsRead,
  markNotificationRead,
  queryNotifications,
} from "@/lib/data/notifications-repository";
import type { NotificationType } from "@/types/notification";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stats = searchParams.get("stats") === "true";
  const feed = searchParams.get("feed") === "true";
  const live = searchParams.get("live") === "true";

  await new Promise((r) => setTimeout(r, 200));

  if (stats) {
    return NextResponse.json({ success: true, data: getNotificationStats() });
  }

  if (feed) {
    const limit = Number(searchParams.get("limit") ?? 8);
    return NextResponse.json({
      success: true,
      data: getBellFeed(limit, live),
    });
  }

  return NextResponse.json(
    queryNotifications({
      search: searchParams.get("search") ?? "",
      type: (searchParams.get("type") as NotificationType | "all") ?? "all",
      read: (searchParams.get("read") as "all" | "read" | "unread") ?? "all",
      sortBy:
        (searchParams.get("sortBy") as "createdAt" | "title" | "type") ??
        "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 10),
    })
  );
}

export async function PATCH(request: Request) {
  const body = await request.json();

  await new Promise((r) => setTimeout(r, 150));

  if (body.action === "mark_all_read") {
    const count = markAllNotificationsRead();
    return NextResponse.json({ success: true, data: { count } });
  }

  if (body.action === "mark_read" && body.id) {
    const updated = markNotificationRead(body.id);
    if (!updated) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}
