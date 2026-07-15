"use client";

import { useEffect, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { useDebounce, usePageMeta } from "@/hooks";
import {
  useActivityLogs,
  useActivityLogStats,
  useActivityLogFilterOptions,
} from "@/hooks/use-activity-logs";
import { ActivityLogsToolbar, type ActivityLogsViewMode } from "./activity-logs-toolbar";
import { ActivityLogsStatsBar } from "./activity-logs-stats-bar";
import { ActivityLogsTable } from "./activity-logs-table";
import { ActivityLogsTimeline } from "./activity-logs-timeline";
import { ActivityLogsPagination } from "./activity-logs-pagination";
import { ActivityLogDetailDrawer } from "./activity-log-detail-drawer";
import type { ActivityLog, AuditAction, AuditModule } from "@/types/activity-log";

export function ActivityLogsView() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<AuditAction | "all">("all");
  const [module, setModule] = useState<AuditModule | "all">("all");
  const [actorId, setActorId] = useState("all");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ActivityLogsViewMode>("table");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "occurredAt", desc: true },
  ]);
  const [selected, setSelected] = useState<ActivityLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const sortBy = sorting[0]?.id ?? "occurredAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isFetching } = useActivityLogs({
    page,
    limit: 10,
    search: debouncedSearch,
    action,
    module,
    actorId,
    sortBy,
    sortOrder,
  });

  const { data: stats, isLoading: statsLoading } = useActivityLogStats();
  const { data: filterOptions } = useActivityLogFilterOptions();

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Activity Logs",
    breadcrumbs: [
      { label: "System", href: "/activity-logs" },
      { label: "Audit Trail" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, action, module, actorId, viewMode]);

  const handleRowClick = (log: ActivityLog) => {
    setSelected(log);
    setDrawerOpen(true);
  };

  return (
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <ActivityLogsStatsBar stats={stats} isLoading={statsLoading} />

        <ActivityLogsToolbar
          search={search}
          onSearchChange={setSearch}
          action={action}
          onActionChange={setAction}
          module={module}
          onModuleChange={setModule}
          actorId={actorId}
          onActorChange={setActorId}
          actors={filterOptions?.actors ?? []}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={data?.meta.total}
        />

        {viewMode === "table" ? (
          <ActivityLogsTable
            logs={data?.data ?? []}
            isLoading={isLoading}
            sorting={sorting}
            onSortingChange={setSorting}
            onRowClick={handleRowClick}
          />
        ) : (
          <ActivityLogsTimeline
            logs={data?.data ?? []}
            isLoading={isLoading}
            onItemClick={handleRowClick}
          />
        )}

        {data?.meta && data.meta.total > 0 && (
          <ActivityLogsPagination meta={data.meta} onPageChange={setPage} />
        )}

        <ActivityLogDetailDrawer
          log={selected}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />

        {isFetching && !isLoading && (
          <div className="flex justify-center">
            <div className="size-1.5 animate-pulse rounded-full bg-primary" />
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
