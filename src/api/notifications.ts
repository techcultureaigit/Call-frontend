import type { PaginatedResponse } from "@/types";
import type { ApiResponse } from "@/types/api";
import type { Notification } from "@/types/notification";
import { apiEndpoints } from "./endpoints";
import { apiDelete, apiGet, apiPatch } from "./http";

export interface NotificationsListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  read?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  info: number;
  success: number;
  warning: number;
  error: number;
}

/** Raw HTTP only — services unwrap `data` */
export const notificationsApi = {
  list: (params: NotificationsListParams = {}) =>
    apiGet<PaginatedResponse<Notification>>(
      apiEndpoints.notifications.list,
      params
    ),

  getFeed: (limit = 8, live = true) =>
    apiGet<ApiResponse<Notification[]>>(apiEndpoints.notifications.list, {
      feed: true,
      limit,
      live,
    }),

  getStats: () =>
    apiGet<ApiResponse<NotificationStats>>(apiEndpoints.notifications.list, {
      stats: true,
    }),

  getById: (id: string) =>
    apiGet<ApiResponse<Notification>>(apiEndpoints.notifications.detail(id)),

  markAsRead: (id: string) =>
    apiPatch<ApiResponse<Notification>>(apiEndpoints.notifications.list, {
      action: "mark_read",
      id,
    }),

  markAllAsRead: () =>
    apiPatch<ApiResponse<{ count: number }>>(apiEndpoints.notifications.list, {
      action: "mark_all_read",
    }),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(apiEndpoints.notifications.detail(id)),
};
