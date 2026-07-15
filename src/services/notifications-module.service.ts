import type { Notification } from "@/types/notification";
import type { PaginatedResponse } from "@/types";
import { createQueryString } from "@/lib/utils";

export interface NotificationsListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  read?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ?? "Request failed"
    );
  }
  return res.json() as Promise<T>;
}

export const notificationsModuleService = {
  async list(params: NotificationsListParams = {}) {
    const query = createQueryString(
      params as Record<string, string | number | boolean | undefined>
    );
    const res = await fetch(`/api/notifications${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return handleResponse<PaginatedResponse<Notification>>(res);
  },

  async getFeed(limit = 8, live = true) {
    const query = createQueryString({ feed: true, limit, live });
    const res = await fetch(`/api/notifications${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: Notification[];
    }>(res);
    return json.data;
  },

  async getStats() {
    const res = await fetch("/api/notifications?stats=true", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
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
    }>(res);
    return json.data;
  },

  async getById(id: string) {
    const res = await fetch(`/api/notifications/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: Notification;
    }>(res);
    return json.data;
  },

  async markAsRead(id: string) {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "mark_read", id }),
    });
    const json = await handleResponse<{
      success: boolean;
      data: Notification;
    }>(res);
    return json.data;
  },

  async markAllAsRead() {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    const json = await handleResponse<{
      success: boolean;
      data: { count: number };
    }>(res);
    return json.data;
  },

  async delete(id: string) {
    const res = await fetch(`/api/notifications/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    return handleResponse<{ success: boolean }>(res);
  },
};
