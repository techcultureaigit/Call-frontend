"use client";

import Link from "next/link";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useNotificationFeed,
  useNotificationMutations,
} from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/types/notification";
import { notificationTypeDot } from "@/components/notifications/notification-type-badge";

export function NotificationBell() {
  const { data: notifications = [], isFetching } = useNotificationFeed();
  const { markAsRead, markAllAsRead } = useNotificationMutations();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className={cn("size-4", isFetching && "opacity-80")} />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute -right-0.5 -top-0.5"
              >
                <Badge
                  variant="notification"
                  className="size-[18px] text-[10px]"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">
            Notifications
            {isFetching && (
              <span className="ml-2 inline-block size-1.5 animate-pulse rounded-full bg-primary" />
            )}
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <Bell className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                All caught up
              </p>
              <p className="text-xs text-muted-foreground">
                No new notifications at the moment.
              </p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "cursor-pointer flex-col items-start gap-1 rounded-none px-4 py-3 focus:bg-accent/50",
                    !notification.read && "bg-accent/30"
                  )}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead.mutate(notification.id);
                    }
                  }}
                  asChild={Boolean(notification.href)}
                >
                  {notification.href ? (
                    <Link href={notification.href}>
                      <NotificationContent notification={notification} />
                    </Link>
                  ) : (
                    <div className="w-full">
                      <NotificationContent notification={notification} />
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator className="m-0" />

        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-full justify-between text-xs text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/notifications">
              View all notifications
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationContent({
  notification,
}: {
  notification: {
    title: string;
    description: string;
    type: NotificationType;
    read: boolean;
    createdAt: string;
  };
}) {
  return (
    <div className="flex w-full gap-3">
      <span
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          notificationTypeDot[notification.type],
          notification.read && "opacity-40"
        )}
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p
          className={cn(
            "text-sm leading-none",
            !notification.read ? "font-medium" : "text-muted-foreground"
          )}
        >
          {notification.title}
        </p>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {notification.description}
        </p>
        <p className="text-[10px] text-muted-foreground/70">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}
