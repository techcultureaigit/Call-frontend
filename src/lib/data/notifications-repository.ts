import {
  LIVE_NOTIFICATION_TEMPLATES,
  MOCK_NOTIFICATIONS,
} from "@/lib/data/mock-notifications";
import type { PaginatedMeta, PaginatedResponse } from "@/types";
import type { Notification, NotificationType } from "@/types/notification";

let notificationsDB: Notification[] = [...MOCK_NOTIFICATIONS];
let lastLiveInjection = Date.now();
let liveCounter = 0;

export interface NotificationsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: NotificationType | "all";
  read?: "all" | "read" | "unread";
  sortBy?: "createdAt" | "title" | "type";
  sortOrder?: "asc" | "desc";
}

function maybeInjectLiveNotification(): void {
  const now = Date.now();
  if (now - lastLiveInjection < 30_000) return;

  lastLiveInjection = now;
  liveCounter += 1;

  const template =
    LIVE_NOTIFICATION_TEMPLATES[
      liveCounter % LIVE_NOTIFICATION_TEMPLATES.length
    ];
  const timestamp = new Date().toISOString();

  notificationsDB = [
    {
      ...template,
      id: `notif-live-${liveCounter}`,
      read: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    ...notificationsDB,
  ];
}

export function queryNotifications(
  params: NotificationsQueryParams = {}
): PaginatedResponse<Notification> {
  const {
    page = 1,
    limit = 10,
    search = "",
    type = "all",
    read = "all",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  let filtered = [...notificationsDB];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q)
    );
  }

  if (type !== "all") filtered = filtered.filter((n) => n.type === type);
  if (read === "read") filtered = filtered.filter((n) => n.read);
  if (read === "unread") filtered = filtered.filter((n) => !n.read);

  filtered.sort((a, b) => {
    const aVal = String(a[sortBy] ?? "");
    const bVal = String(b[sortBy] ?? "");
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  const meta: PaginatedMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { data: filtered.slice(start, start + limit), meta };
}

export function getBellFeed(limit = 8, live = false): Notification[] {
  if (live) maybeInjectLiveNotification();
  return [...notificationsDB]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

export function getRecentNotifications(limit = 4): Notification[] {
  return getBellFeed(limit, false);
}

export function getNotificationStats() {
  return {
    total: notificationsDB.length,
    unread: notificationsDB.filter((n) => !n.read).length,
    read: notificationsDB.filter((n) => n.read).length,
    info: notificationsDB.filter((n) => n.type === "info").length,
    success: notificationsDB.filter((n) => n.type === "success").length,
    warning: notificationsDB.filter((n) => n.type === "warning").length,
    error: notificationsDB.filter((n) => n.type === "error").length,
  };
}

export function getNotificationById(id: string): Notification | undefined {
  return notificationsDB.find((n) => n.id === id);
}

export function markNotificationRead(id: string): Notification | undefined {
  const index = notificationsDB.findIndex((n) => n.id === id);
  if (index === -1) return undefined;

  const updated = {
    ...notificationsDB[index],
    read: true,
    updatedAt: new Date().toISOString(),
  };
  notificationsDB[index] = updated;
  return updated;
}

export function markAllNotificationsRead(): number {
  const now = new Date().toISOString();
  let count = 0;

  notificationsDB = notificationsDB.map((n) => {
    if (!n.read) count += 1;
    return { ...n, read: true, updatedAt: now };
  });

  return count;
}

export function deleteNotification(id: string): boolean {
  const before = notificationsDB.length;
  notificationsDB = notificationsDB.filter((n) => n.id !== id);
  return notificationsDB.length < before;
}
