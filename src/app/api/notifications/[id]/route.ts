import { NextResponse } from "next/server";
import {
  deleteNotification,
  getNotificationById,
  markNotificationRead,
} from "@/lib/data/notifications-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await new Promise((r) => setTimeout(r, 150));

  const notification = getNotificationById(id);
  if (!notification) {
    return NextResponse.json(
      { message: "Notification not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: notification });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  await new Promise((r) => setTimeout(r, 150));

  if (body.action === "mark_read" || body.read === true) {
    const updated = markNotificationRead(id);
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteNotification(id);
  if (!deleted) {
    return NextResponse.json(
      { message: "Notification not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true });
}
