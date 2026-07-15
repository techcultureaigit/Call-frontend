"use client";

import { useCallback, useEffect, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { useDebounce, usePageMeta } from "@/hooks";
import {
  useResponses,
  useResponseStats,
  useResponseFilterOptions,
  useResponseMutations,
} from "@/hooks/use-responses";
import { exportResponsesCSV } from "@/lib/utils/responses-export";
import { ResponsesToolbar, type ResponsesViewMode } from "./responses-toolbar";
import { ResponsesTable } from "./responses-table";
import { ResponsesPagination } from "./responses-pagination";
import { ResponsesStatsBar } from "./responses-stats-bar";
import { ResponseDetailDrawer } from "./response-detail-drawer";
import type { ResponseStatus, SurveyResponse } from "@/types/response";

interface ResponsesViewProps {
  viewMode?: ResponsesViewMode;
}

export function ResponsesView({ viewMode = "all" }: ResponsesViewProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ResponseStatus | "all">("all");
  const [campaignId, setCampaignId] = useState("all");
  const [surveyId, setSurveyId] = useState("all");
  const [sentiment, setSentiment] = useState<
    "positive" | "neutral" | "negative" | "all"
  >("all");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "submittedAt", desc: true },
  ]);
  const [selected, setSelected] = useState<SurveyResponse | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const sortBy = sorting[0]?.id ?? "submittedAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const effectiveStatus =
    viewMode === "pending"
      ? "pending_review"
      : viewMode === "flagged"
        ? "flagged"
        : status;

  const { data, isLoading, isFetching } = useResponses({
    page,
    limit: 10,
    search: debouncedSearch,
    status: effectiveStatus,
    campaignId,
    surveyId,
    sentiment,
    sortBy: sortBy === "customerName" ? "customerName" : sortBy,
    sortOrder,
  });

  const { data: stats, isLoading: statsLoading } = useResponseStats();
  const { data: filterOptions } = useResponseFilterOptions();
  const { exportResponses } = useResponseMutations();

  const titles: Record<ResponsesViewMode, string> = {
    all: "Responses",
    pending: "Pending Review",
    flagged: "Flagged",
  };

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: titles[viewMode],
    breadcrumbs: [
      { label: "Operations", href: "/responses" },
      { label: titles[viewMode] },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta, viewMode]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, campaignId, surveyId, sentiment, viewMode]);

  const handleExport = useCallback(async () => {
    try {
      const rows = await exportResponses.mutateAsync({
        search: debouncedSearch,
        status: effectiveStatus,
        campaignId,
        surveyId,
        sentiment,
      });
      exportResponsesCSV(rows);
      toast.success(`Exported ${rows.length} responses`);
    } catch {
      toast.error("Export failed");
    }
  }, [
    debouncedSearch,
    effectiveStatus,
    campaignId,
    surveyId,
    sentiment,
    exportResponses,
  ]);

  return (
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <ResponsesStatsBar stats={stats} isLoading={statsLoading} />

        <ResponsesToolbar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          campaignId={campaignId}
          onCampaignChange={setCampaignId}
          surveyId={surveyId}
          onSurveyChange={setSurveyId}
          sentiment={sentiment}
          onSentimentChange={setSentiment}
          campaigns={filterOptions?.campaigns ?? []}
          surveys={filterOptions?.surveys ?? []}
          onExport={handleExport}
          isExporting={exportResponses.isPending}
          viewMode={viewMode}
          totalCount={data?.meta.total}
        />

        <ResponsesTable
          responses={data?.data ?? []}
          isLoading={isLoading}
          sorting={sorting}
          onSortingChange={setSorting}
          onRowClick={(r) => {
            setSelected(r);
            setDrawerOpen(true);
          }}
        />

        {data?.meta && data.meta.total > 0 && (
          <ResponsesPagination
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

      <ResponseDetailDrawer
        response={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </PageContainer>
  );
}
