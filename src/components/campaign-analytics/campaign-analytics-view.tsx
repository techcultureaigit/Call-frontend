"use client";

import { useCallback, useEffect, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { useDebounce, usePageMeta } from "@/hooks";
import {
  useCampaignAnalytics,
  useCampaignAnalyticsRefresh,
} from "@/hooks/use-campaign-analytics";
import {
  exportAnalyticsExcel,
  exportAnalyticsPdf,
} from "@/lib/utils/campaign-analytics-export";
import { AnalyticsHeader } from "./analytics-header";
import { AnalyticsKpiGrid } from "./analytics-kpi-grid";
import {
  PerformanceLineChart,
  DailyCallsBarChart,
  CallStatusPieChart,
  SuccessRateAreaChart,
  CampaignComparisonChart,
  ResponseRateTrendChart,
  LanguageDistributionChart,
  EngagementHeatmap,
} from "./analytics-charts";
import { AnalyticsAiSection } from "./analytics-ai-section";
import { AnalyticsFilters } from "./analytics-filters";
import { AnalyticsPerformanceTable } from "./analytics-performance-table";
import { AnalyticsLeaderboard } from "./analytics-leaderboard";
import { AnalyticsActivities } from "./analytics-activities";
import { AnalyticsRealtime } from "./analytics-realtime";
import { AnalyticsEmptyState } from "./analytics-empty-state";

function defaultDates() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export function CampaignAnalyticsView() {
  const defaults = defaultDates();
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [campaignId, setCampaignId] = useState("all");
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [language, setLanguage] = useState("all");
  const [surveyId, setSurveyId] = useState("all");
  const [createdBy, setCreatedBy] = useState("all");
  const [tag, setTag] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "successRate", desc: true },
  ]);

  const debouncedSearch = useDebounce(tableSearch, 300);
  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isFetching, refetch } = useCampaignAnalytics({
    from: dateFrom,
    to: dateTo,
    campaignId: campaignId === "all" ? undefined : campaignId,
    comparePeriod: compareEnabled,
    search: debouncedSearch,
    status: status === "all" ? undefined : status,
    language: language === "all" ? undefined : language,
    surveyId: surveyId === "all" ? undefined : surveyId,
    createdBy: createdBy === "all" ? undefined : createdBy,
    tag: tag === "all" ? undefined : tag,
    page,
    limit: 8,
    sortBy,
    sortOrder,
  });

  const refresh = useCampaignAnalyticsRefresh();

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Campaign Analytics",
    breadcrumbs: [
      { label: "Campaigns", href: "/campaigns" },
      { label: "Analytics" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    status,
    language,
    surveyId,
    createdBy,
    tag,
    campaignId,
    dateFrom,
    dateTo,
  ]);

  const handlePreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateFrom(from.toISOString().split("T")[0]);
    setDateTo(to.toISOString().split("T")[0]);
  };

  const handleRefresh = useCallback(async () => {
    await refresh();
    await refetch();
    toast.success("Analytics refreshed");
  }, [refresh, refetch]);

  const handleExportPdf = useCallback(() => {
    if (!data) return;
    exportAnalyticsPdf(data);
    toast.success("PDF export opened — use Save as PDF in print dialog");
  }, [data]);

  const handleExportExcel = useCallback(() => {
    if (!data) return;
    exportAnalyticsExcel(data);
    toast.success("Excel file downloaded");
  }, [data]);

  if (!isLoading && data?.isEmpty) {
    return (
      <PageContainer size="wide">
        <AnalyticsEmptyState />
      </PageContainer>
    );
  }

  return (
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
        id="campaign-analytics-export"
      >
        <AnalyticsHeader
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onPreset={handlePreset}
          campaignId={campaignId}
          onCampaignChange={setCampaignId}
          campaigns={data?.filterOptions.campaigns ?? []}
          compareEnabled={compareEnabled}
          onCompareToggle={() => setCompareEnabled((v) => !v)}
          onExportPdf={handleExportPdf}
          onExportExcel={handleExportExcel}
          onRefresh={handleRefresh}
          isRefreshing={isFetching}
        />

        <AnalyticsKpiGrid
          kpis={data?.kpis ?? []}
          isLoading={isLoading}
          compareEnabled={compareEnabled}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PerformanceLineChart
            data={data?.performanceLine ?? []}
            isLoading={isLoading}
            compareEnabled={compareEnabled}
          />
          <DailyCallsBarChart
            data={data?.dailyCalls ?? []}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <CallStatusPieChart
            data={data?.callStatusPie ?? []}
            isLoading={isLoading}
          />
          <div className="lg:col-span-2">
            <SuccessRateAreaChart
              data={data?.successRateArea ?? []}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <CampaignComparisonChart
            data={data?.campaignComparison ?? []}
            isLoading={isLoading}
          />
          <ResponseRateTrendChart
            data={data?.responseRateTrend ?? []}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LanguageDistributionChart
            data={data?.languageDistribution ?? []}
            isLoading={isLoading}
          />
          <EngagementHeatmap
            data={data?.engagementHeatmap ?? []}
            isLoading={isLoading}
          />
        </div>

        <AnalyticsAiSection
          data={data?.aiAnalytics}
          isLoading={isLoading}
        />

        <AnalyticsLeaderboard
          campaigns={data?.topPerforming ?? []}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnalyticsRealtime data={data?.realtime} isLoading={isLoading} />
          <AnalyticsActivities
            activities={data?.recentActivities ?? []}
            isLoading={isLoading}
          />
        </div>

        <div className="space-y-4">
          {data?.filterOptions && (
            <AnalyticsFilters
              search={tableSearch}
              onSearchChange={setTableSearch}
              status={status}
              onStatusChange={setStatus}
              language={language}
              onLanguageChange={setLanguage}
              surveyId={surveyId}
              onSurveyChange={setSurveyId}
              createdBy={createdBy}
              onCreatedByChange={setCreatedBy}
              tag={tag}
              onTagChange={setTag}
              filterOptions={data.filterOptions}
              open={filtersOpen}
              onToggle={() => setFiltersOpen((v) => !v)}
            />
          )}

          <AnalyticsPerformanceTable
            rows={data?.performanceTable ?? []}
            meta={data?.tableMeta}
            isLoading={isLoading}
            sorting={sorting}
            onSortingChange={setSorting}
            onPageChange={setPage}
          />
        </div>

        {isFetching && !isLoading && (
          <div className="flex justify-center py-2">
            <div className="size-1.5 animate-pulse rounded-full bg-primary" />
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
