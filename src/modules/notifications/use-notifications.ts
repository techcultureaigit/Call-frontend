"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  deleteNotification,
  getNotificationFeed,
  getNotificationStats,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationsListParams,
} from "./api";

export function useNotifications(params: NotificationsListParams) {
  return useQuery({
    queryKey: queryKeys.notifications.module(
      params as Record<string, unknown>
    ),
    queryFn: () => listNotifications(params),
    placeholderData: (prev) => prev,
  });
}

export function useNotificationFeed() {
  return useQuery({
    queryKey: queryKeys.notifications.feed(),
    queryFn: () => getNotificationFeed(8, true),
    // Bell badge only — avoid hammering mock/API every few seconds
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: queryKeys.notifications.stats(),
    queryFn: getNotificationStats,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const markAsRead = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Failed to mark as read"),
  });

  const markAllAsRead = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: (data) => {
      toast.success(
        data.count > 0
          ? `${data.count} notification${data.count === 1 ? "" : "s"} marked as read`
          : "All caught up"
      );
      invalidate();
    },
    onError: () => toast.error("Failed to mark all as read"),
  });

  const removeNotification = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      toast.success("Notification removed");
      invalidate();
    },
    onError: () => toast.error("Failed to remove notification"),
  });

  return { markAsRead, markAllAsRead, removeNotification };
}

export type { NotificationsListParams };
