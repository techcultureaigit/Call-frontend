/**
 * api.ts
 * Notifications HTTP API — all backend calls live here.
 * Debug: [notifications-api] in DevTools console.
 *
 * listNotifications()          GET    /api/notifications
 * getNotificationFeed()        GET    /api/notifications?feed=true
 * getNotificationStats()       GET    /api/notifications?stats=true
 * getNotification()            GET    /api/notifications/:id
 * markNotificationAsRead()     PATCH  /api/notifications
 * markAllNotificationsAsRead() PATCH  /api/notifications
 * deleteNotification()         DELETE /api/notifications/:id
 */
import {
  apiDelete,
  apiGet,
  apiPatch,
  unwrapData,
} from "@/api/http";
import { createModuleApiCall } from "@/lib/api/module-helpers";
import type { PaginatedResponse } from "@/types";
import type { ApiResponse } from "@/types/api";
import type { Notification } from "@/types/notification";
import type {
  NotificationStats,
  NotificationsListParams,
} from "./notifications-types";

export type { NotificationStats, NotificationsListParams };

const notificationsCall = createModuleApiCall("notifications");

/* ========== LIST — GET /api/notifications ========== */

/** listNotifications() → GET /api/notifications */
export async function listNotifications(
  params: NotificationsListParams = {}
) {
  return notificationsCall(
    "listNotifications",
    "GET",
    "/api/notifications",
    async () => {
      return await apiGet<PaginatedResponse<Notification>>(
        "/api/notifications",
        params
      );
    },
    params
  );
}

/** getNotificationFeed() → GET /api/notifications?feed=true */
export async function getNotificationFeed(limit = 8, live = true) {
  const query = { feed: true, limit, live };
  return notificationsCall(
    "getNotificationFeed",
    "GET",
    "/api/notifications",
    async () => {
      return await unwrapData(
        apiGet<ApiResponse<Notification[]>>("/api/notifications", query)
      );
    },
    query
  );
}

/** getNotificationStats() → GET /api/notifications?stats=true */
export async function getNotificationStats() {
  const query = { stats: true };
  return notificationsCall(
    "getNotificationStats",
    "GET",
    "/api/notifications",
    async () => {
      return await unwrapData(
        apiGet<ApiResponse<NotificationStats>>("/api/notifications", query)
      );
    },
    query
  );
}

/* ========== READ — GET /api/notifications/:id ========== */

/** getNotification() → GET /api/notifications/:id */
export async function getNotification(id: string) {
  const url = `/api/notifications/${id}`;
  return notificationsCall("getNotification", "GET", url, async () => {
    return await unwrapData(apiGet<ApiResponse<Notification>>(url));
  }, { id });
}

/* ========== UPDATE — PATCH /api/notifications ========== */

/** markNotificationAsRead() → PATCH /api/notifications */
export async function markNotificationAsRead(id: string) {
  const body = { action: "mark_read", id };
  return notificationsCall(
    "markNotificationAsRead",
    "PATCH",
    "/api/notifications",
    async () => {
      return await unwrapData(
        apiPatch<ApiResponse<Notification>>("/api/notifications", body)
      );
    },
    body
  );
}

/** markAllNotificationsAsRead() → PATCH /api/notifications */
export async function markAllNotificationsAsRead() {
  const body = { action: "mark_all_read" };
  return notificationsCall(
    "markAllNotificationsAsRead",
    "PATCH",
    "/api/notifications",
    async () => {
      return await unwrapData(
        apiPatch<ApiResponse<{ count: number }>>("/api/notifications", body)
      );
    },
    body
  );
}

/* ========== DELETE — DELETE /api/notifications/:id ========== */

/** deleteNotification() → DELETE /api/notifications/:id */
export async function deleteNotification(id: string) {
  const url = `/api/notifications/${id}`;
  return notificationsCall("deleteNotification", "DELETE", url, async () => {
    await apiDelete<ApiResponse<null>>(url);
  }, { id });
}

/* ---------- namespace ---------- */
export const notificationsApi = {
  list: listNotifications,
  getFeed: getNotificationFeed,
  getStats: getNotificationStats,
  getById: getNotification,
  markAsRead: markNotificationAsRead,
  markAllAsRead: markAllNotificationsAsRead,
  delete: deleteNotification,
};
