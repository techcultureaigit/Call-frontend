"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { useDebounce, usePageMeta } from "@/hooks";
import {
  useNotifications,
  useNotificationStats,
  useNotificationMutations,
} from "@/hooks/use-notifications";
import { NotificationsToolbar } from "./notifications-toolbar";
import { NotificationsStatsBar } from "./notifications-stats-bar";
import { NotificationsList } from "./notifications-list";
import { NotificationsPagination } from "./notifications-pagination";
import type { NotificationType } from "@/types/notification";

export function NotificationsView() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<NotificationType | "all">("all");
  const [read, setRead] = useState<"all" | "read" | "unread">("all");
  const [page, setPage] = useState(1);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isFetching } = useNotifications({
    page,
    limit: 10,
    search: debouncedSearch,
    type,
    read,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: stats, isLoading: statsLoading } = useNotificationStats();
  const { markAsRead, markAllAsRead } = useNotificationMutations();

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Notifications",
    breadcrumbs: [
      { label: "System", href: "/notifications" },
      { label: "Notifications" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, type, read]);

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      setMarkingId(id);
      try {
        await markAsRead.mutateAsync(id);
      } finally {
        setMarkingId(null);
      }
    },
    [markAsRead]
  );

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  return (
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <NotificationsStatsBar stats={stats} isLoading={statsLoading} />

        <NotificationsToolbar
          search={search}
          onSearchChange={setSearch}
          type={type}
          onTypeChange={setType}
          read={read}
          onReadChange={setRead}
          onMarkAllRead={handleMarkAllRead}
          isMarkingAll={markAllAsRead.isPending}
          unreadCount={stats?.unread}
          totalCount={data?.meta.total}
        />

        <NotificationsList
          notifications={data?.data ?? []}
          isLoading={isLoading}
          onMarkAsRead={handleMarkAsRead}
          isMarkingId={markingId}
        />

        {data?.meta && data.meta.total > 0 && (
          <NotificationsPagination
            meta={data.meta}
            onPageChange={setPage}
          />
        )}

        {isFetching && !isLoading && (
          <div className="flex justify-center">
            <div className="size-1.5 animate-pulse rounded-full bg-primary" />
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
