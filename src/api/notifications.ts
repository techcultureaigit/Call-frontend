import type { PaginatedResponse } from "@/types";
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

export const notificationsApi = {
  list: (params: NotificationsListParams = {}) =>
    apiGet<PaginatedResponse<Notification>>(
      apiEndpoints.notifications.list,
      params
    ),

  getFeed: async (limit = 8, live = true) => {
    const json = await apiGet<{
      success: boolean;
      data: Notification[];
    }>(apiEndpoints.notifications.list, { feed: true, limit, live });
    return json.data;
  },

  getStats: async () => {
    const json = await apiGet<{
      success: boolean;
      data: {
        total: number;
        unread: number;
        read: number;
        info: number;
        success: number;
        warning: number;
        error: number;
      };
    }>(apiEndpoints.notifications.list, { stats: true });
    return json.data;
  },

  getById: async (id: string) => {
    const json = await apiGet<{
      success: boolean;
      data: Notification;
    }>(apiEndpoints.notifications.detail(id));
    return json.data;
  },

  markAsRead: async (id: string) => {
    const json = await apiPatch<{
      success: boolean;
      data: Notification;
    }>(apiEndpoints.notifications.list, { action: "mark_read", id });
    return json.data;
  },

  markAllAsRead: async () => {
    const json = await apiPatch<{
      success: boolean;
      data: { count: number };
    }>(apiEndpoints.notifications.list, { action: "mark_all_read" });
    return json.data;
  },

  delete: (id: string) =>
    apiDelete<{ success: boolean }>(apiEndpoints.notifications.detail(id)),
};
