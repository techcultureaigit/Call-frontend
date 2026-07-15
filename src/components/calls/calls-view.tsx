"use client";

import { useCallback, useEffect, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { useDebounce, usePageMeta } from "@/hooks";
import { useCalls, useCallStats, useCallMutations } from "@/hooks/use-calls";
import { CallsToolbar, type CallsViewMode } from "./calls-toolbar";
import { CallsTable } from "./calls-table";
import { CallsPagination } from "./calls-pagination";
import { CallsStatsBar } from "./calls-stats-bar";
import { CallTranscriptDrawer } from "./call-transcript-drawer";
import type { Call, CallStatus } from "@/types/call";

interface CallsViewProps {
  viewMode?: CallsViewMode;
}

export function CallsView({ viewMode = "history" }: CallsViewProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CallStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "startedAt", desc: true },
  ]);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [retryingId, setRetryingId] = useState<string>();

  const debouncedSearch = useDebounce(search, 300);
  const sortBy = sorting[0]?.id ?? "startedAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isFetching } = useCalls({
    page,
    limit: 10,
    search: debouncedSearch,
    status: viewMode === "live" ? "all" : status,
    liveOnly: viewMode === "live",
    hasRecording: viewMode === "recordings",
    sortBy: sortBy === "customerName" ? "customerName" : sortBy,
    sortOrder,
  });

  const { data: stats, isLoading: statsLoading } = useCallStats();
  const { retryCall } = useCallMutations();

  const pageTitles: Record<CallsViewMode, string> = {
    history: "Call History",
    live: "Live Calls",
    recordings: "Recordings",
  };

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: pageTitles[viewMode],
    breadcrumbs: [
      { label: "Operations", href: "/calls/history" },
      { label: pageTitles[viewMode] },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta, viewMode]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, viewMode]);

  const handleRowClick = (call: Call) => {
    setSelectedCall(call);
    setDrawerOpen(true);
  };

  const handleRetry = useCallback(
    async (id: string) => {
      setRetryingId(id);
      try {
        await retryCall.mutateAsync(id);
        setDrawerOpen(false);
        setSelectedCall(null);
      } finally {
        setRetryingId(undefined);
      }
    },
    [retryCall]
  );

  return (
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <CallsStatsBar stats={stats} isLoading={statsLoading} />

        <CallsToolbar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          viewMode={viewMode}
          totalCount={data?.meta.total}
        />

        <CallsTable
          calls={data?.data ?? []}
          isLoading={isLoading}
          sorting={sorting}
          onSortingChange={setSorting}
          onRowClick={handleRowClick}
          onRetry={handleRetry}
          isRetryingId={retryingId}
        />

        {data?.meta && data.meta.total > 0 && (
          <CallsPagination meta={data.meta} onPageChange={setPage} />
        )}

        {isFetching && !isLoading && (
          <div className="flex justify-center">
            <div className="size-1.5 animate-pulse rounded-full bg-primary" />
          </div>
        )}
      </motion.div>

      <CallTranscriptDrawer
        call={selectedCall}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onRetry={handleRetry}
        isRetrying={retryCall.isPending}
      />
    </PageContainer>
  );
}
