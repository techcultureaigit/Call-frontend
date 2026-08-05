"use client";

import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "./dashboard-skeleton";
import { DashboardCard } from "./dashboard-card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { DashboardNotification } from "@/types/dashboard";
import type { NotificationType } from "@/types/notification";

const typeStyles: Record<NotificationType, string> = {
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-destructive",
};

interface RecentNotificationsListProps {
  notifications: DashboardNotification[];
  isLoading?: boolean;
}

export function RecentNotificationsList({
  notifications,
  isLoading,
}: RecentNotificationsListProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <DashboardCard title="Recent Notifications" description="System alerts & updates">
        <ListSkeleton rows={4} />
      </DashboardCard>
    );
  }

  if (notifications.length === 0) {
    return (
      <DashboardCard title="Recent Notifications" description="System alerts & updates">
        <EmptyState
          icon={Bell}
          title="All caught up"
          description="No notifications at the moment."
          compact
        />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Recent Notifications"
      description="System alerts & updates"
      icon={Bell}
      action={
        unreadCount > 0 ? (
          <Badge variant="secondary" className="text-[10px]">
            {unreadCount} new
          </Badge>
        ) : undefined
      }
    >
      <ul className="space-y-1">
        {notifications.map((notification, index) => (
          <li
            key={notification.id}
            className={cn(
              "flex gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40",
              !notification.read && "bg-muted/20",
              index !== notifications.length - 1 && "border-b border-border/40"
            )}
          >
            <span
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                typeStyles[notification.type],
                notification.read && "opacity-40"
              )}
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm leading-tight",
                  !notification.read ? "font-medium" : "text-muted-foreground"
                )}
              >
                {notification.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {notification.description}
              </p>
              <p className="mt-1.5 text-[10px] text-muted-foreground/70">
                {formatRelativeTime(notification.createdAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
