/**
 * notifications-types.ts — Notifications module types (no API calls).
 */
import type { Notification } from "@/types/notification";

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

export type { Notification };
