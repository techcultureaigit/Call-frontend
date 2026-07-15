"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SortingState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { useDebounce, usePageMeta } from "@/hooks";
import {
  useCampaigns,
  useCampaignAggregateStats,
  useCampaignMutations,
} from "@/hooks/use-campaigns";
import { CampaignsToolbar, type CampaignViewMode } from "./campaigns-toolbar";
import { CampaignCardsGrid } from "./campaign-cards-grid";
import { CampaignsTable } from "./campaigns-table";
import { CampaignsPagination } from "./campaigns-pagination";
import { CampaignStatsCard } from "./campaign-stats-card";
import type { CampaignStatus, CampaignType } from "@/types/campaign";

export function CampaignsView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CampaignStatus | "all">("all");
  const [type, setType] = useState<CampaignType | "all">("all");
  const [viewMode, setViewMode] = useState<CampaignViewMode>("cards");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const debouncedSearch = useDebounce(search, 300);
  const sortBy = sorting[0]?.id ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isFetching } = useCampaigns({
    page,
    limit: viewMode === "cards" ? 9 : 10,
    search: debouncedSearch,
    status,
    type,
    sortBy: sortBy === "name" ? "name" : sortBy,
    sortOrder,
    live: true,
  });

  const { data: aggregateStats, isLoading: statsLoading } =
    useCampaignAggregateStats();

  const {
    pauseCampaign,
    resumeCampaign,
    stopCampaign,
    launchCampaign,
    retryFailedCalls,
  } = useCampaignMutations();

  const isActionLoading =
    pauseCampaign.isPending ||
    resumeCampaign.isPending ||
    stopCampaign.isPending ||
    launchCampaign.isPending ||
    retryFailedCalls.isPending;

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Campaigns",
    breadcrumbs: [
      { label: "Engagement", href: "/campaigns" },
      { label: "Campaigns" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, type, viewMode]);

  const handlePause = useCallback(
    (id: string) => pauseCampaign.mutate(id),
    [pauseCampaign]
  );
  const handleResume = useCallback(
    (id: string) => resumeCampaign.mutate(id),
    [resumeCampaign]
  );
  const handleStop = useCallback(
    (id: string) => stopCampaign.mutate(id),
    [stopCampaign]
  );
  const handleRetry = useCallback(
    (id: string) => retryFailedCalls.mutate(id),
    [retryFailedCalls]
  );
  const handleLaunch = useCallback(
    (id: string) => launchCampaign.mutate(id),
    [launchCampaign]
  );

  return (
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <CampaignStatsCard stats={aggregateStats} isLoading={statsLoading} />

        <CampaignsToolbar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          type={type}
          onTypeChange={setType}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateClick={() => router.push("/campaigns/new")}
          totalCount={data?.meta.total}
        />

        {viewMode === "cards" ? (
          <CampaignCardsGrid
            campaigns={data?.data ?? []}
            isLoading={isLoading}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onRetry={handleRetry}
            onLaunch={handleLaunch}
            isActionLoading={isActionLoading}
          />
        ) : (
          <CampaignsTable
            campaigns={data?.data ?? []}
            isLoading={isLoading}
            sorting={sorting}
            onSortingChange={setSorting}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onRetry={handleRetry}
            onLaunch={handleLaunch}
            isActionLoading={isActionLoading}
          />
        )}

        {data?.meta && data.meta.total > 0 && (
          <CampaignsPagination meta={data.meta} onPageChange={setPage} />
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
