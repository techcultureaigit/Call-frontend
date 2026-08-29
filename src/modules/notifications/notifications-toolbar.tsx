"use client";

import { CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PAGE_TITLE_CLASS } from "@/components/shared/page-heading";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { TOOLBAR_SEARCH_WIDTH_CLASS } from "@/components/shared/toolbar-styles";
import {
  NOTIFICATION_READ_OPTIONS,
  NOTIFICATION_TYPE_OPTIONS,
} from "@/modules/notifications/notifications-constants";
import type { NotificationType } from "@/types/notification";

const FILTER_SELECT_CLASS =
  "h-9 w-full min-w-[120px] rounded-[6px] border-border/50 bg-background/80 shadow-subtle sm:w-auto lg:h-11";

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
          <h2 className={PAGE_TITLE_CLASS}>Notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay on top of campaigns, calls, responses, and system alerts.
            {totalCount !== undefined && (
              <span className="ml-1 text-foreground/70">
                · {totalCount} total
              </span>
            )}
          </p>
        </div>

        {unreadCount > 0 ? (
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
        ) : null}
      </div>

      <ListToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search notifications..."
        searchAriaLabel="Search notifications"
        searchClassName={TOOLBAR_SEARCH_WIDTH_CLASS}
        alignControlsEnd
        filters={
          <>
            <Select
              value={read}
              onChange={(e) =>
                onReadChange(e.target.value as "all" | "read" | "unread")
              }
              options={NOTIFICATION_READ_OPTIONS.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
              className={FILTER_SELECT_CLASS}
              aria-label="Filter by read status"
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
              className={FILTER_SELECT_CLASS}
              aria-label="Filter by type"
            />
          </>
        }
        actions={
          hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-9 gap-1 text-muted-foreground lg:h-11"
            >
              <X className="size-3.5" />
              Clear
            </Button>
          ) : null
        }
      />
    </div>
  );
}
