"use client";

import { CheckCheck, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  NOTIFICATION_READ_OPTIONS,
  NOTIFICATION_TYPE_OPTIONS,
} from "@/lib/constants/notifications";
import type { NotificationType } from "@/types/notification";

interface NotificationsToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  type: NotificationType | "all";
  onTypeChange: (v: NotificationType | "all") => void;
  read: "all" | "read" | "unread";
  onReadChange: (v: "all" | "read" | "unread") => void;
  onMarkAllRead: () => void;
  isMarkingAll?: boolean;
  unreadCount?: number;
  totalCount?: number;
}

export function NotificationsToolbar({
  search,
  onSearchChange,
  type,
  onTypeChange,
  read,
  onReadChange,
  onMarkAllRead,
  isMarkingAll,
  unreadCount = 0,
  totalCount,
}: NotificationsToolbarProps) {
  const hasFilters = search.length > 0 || type !== "all" || read !== "all";

  const clearAll = () => {
    onSearchChange("");
    onTypeChange("all");
    onReadChange("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay on top of campaigns, calls, responses, and system alerts.
            {totalCount !== undefined && (
              <span className="ml-1 text-foreground/70">
                · {totalCount} total
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllRead}
              disabled={isMarkingAll}
              className="h-9 gap-1.5"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notifications..."
              className="h-9 pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="size-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </div>

            <Select
              value={read}
              onChange={(e) =>
                onReadChange(e.target.value as "all" | "read" | "unread")
              }
              options={NOTIFICATION_READ_OPTIONS.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
              className="h-9 w-full min-w-[120px] sm:w-auto"
            />

            <Select
              value={type}
              onChange={(e) =>
                onTypeChange(e.target.value as NotificationType | "all")
              }
              options={NOTIFICATION_TYPE_OPTIONS.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
              className="h-9 w-full min-w-[120px] sm:w-auto"
            />

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-9 gap-1 text-muted-foreground"
              >
                <X className="size-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
