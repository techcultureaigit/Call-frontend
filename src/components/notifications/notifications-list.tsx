"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";
import {
  NotificationTypeBadge,
  notificationTypeDot,
} from "./notification-type-badge";

interface NotificationsListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead: (id: string) => void;
  isMarkingId?: string | null;
}

export function NotificationsList({
  notifications,
  isLoading,
  onMarkAsRead,
  isMarkingId,
}: NotificationsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-card">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3">
            <Skeleton className="size-2.5 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card shadow-card">
        <EmptyState
          icon={Bell}
          title="No notifications found"
          description="Try adjusting your search or filters."
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-card">
      <ul className="divide-y divide-border/50">
        {notifications.map((notification, index) => (
          <motion.li
            key={notification.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <NotificationRow
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              isMarking={isMarkingId === notification.id}
            />
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function NotificationRow({
  notification,
  onMarkAsRead,
  isMarking,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  isMarking?: boolean;
}) {
  const content = (
    <div className="flex w-full gap-4 px-4 py-4 sm:px-5">
      <div className="relative mt-1.5 shrink-0">
        <span
          className={cn(
            "block size-2.5 rounded-full",
            notificationTypeDot[notification.type],
            notification.read && "opacity-40"
          )}
        />
        {!notification.read && (
          <span className="absolute -right-0.5 -top-0.5 size-2 animate-pulse rounded-full bg-primary/60" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "text-sm leading-tight",
              !notification.read
                ? "font-semibold text-foreground"
                : "font-medium text-muted-foreground"
            )}
          >
            {notification.title}
          </p>
          <NotificationTypeBadge type={notification.type} />
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {notification.description}
        </p>

        <p className="text-[11px] text-muted-foreground/70">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            disabled={isMarking}
          >
            <Check className="size-3.5" />
            <span className="hidden sm:inline">Mark read</span>
          </Button>
        )}

        {notification.href && (
          <span className="inline-flex items-center gap-1 text-xs text-primary">
            <ExternalLink className="size-3" />
            <span className="hidden sm:inline">View</span>
          </span>
        )}
      </div>
    </div>
  );

  const rowClass = cn(
    "block transition-colors hover:bg-muted/30",
    !notification.read && "bg-accent/20"
  );

  if (notification.href) {
    return (
      <Link
        href={notification.href}
        className={rowClass}
        onClick={() => {
          if (!notification.read) onMarkAsRead(notification.id);
        }}
      >
        {content}
      </Link>
    );
  }

  return <div className={rowClass}>{content}</div>;
}
