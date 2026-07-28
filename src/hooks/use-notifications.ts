"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  notificationsModuleService,
  type NotificationsListParams,
} from "@/services/notifications-module.service";

export function useNotifications(params: NotificationsListParams) {
  return useQuery({
    queryKey: queryKeys.notifications.module(
      params as Record<string, unknown>
    ),
    queryFn: () => notificationsModuleService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useNotificationFeed() {
  return useQuery({
    queryKey: queryKeys.notifications.feed(),
    queryFn: () => notificationsModuleService.getFeed(8, true),
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: queryKeys.notifications.stats(),
    queryFn: () => notificationsModuleService.getStats(),
    refetchInterval: 15_000,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationsModuleService.markAsRead(id),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Failed to mark as read"),
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsModuleService.markAllAsRead(),
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
    mutationFn: (id: string) => notificationsModuleService.delete(id),
    onSuccess: () => {
      toast.success("Notification removed");
      invalidate();
    },
    onError: () => toast.error("Failed to remove notification"),
  });

  return { markAsRead, markAllAsRead, removeNotification };
}
