"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { PageContainer } from "@/components/layout";
import { usePageMeta } from "@/hooks";
import { useReports, useReportCampaigns } from "@/modules/reports/use-reports";
import {
  exportReportsExcel,
  exportReportsPdf,
} from "@/modules/reports/reports-export";
import { AnalyticsKpiGrid } from "@/modules/reports/analytics-kpi-grid";
import {
  applyKpiFilter,
  KPI_FILTER_LABELS,
  type AnalyticsKpiFilterId,
} from "@/modules/reports/analytics-kpi-filter";
import { ReportsToolbar } from "./reports-toolbar";
import { ReportCallPerformanceBars } from "./report-call-performance-bars";
import { ReportDashboardDonut } from "./report-dashboard-donut";
import { ReportHeroChart } from "./report-hero-chart";
import { ReportHeatmap } from "./report-heatmap";
import { ReportHangupBars } from "./report-hangup-bars";
import { ReportInsights } from "./report-insights";
import { ReportQuestionBars } from "./report-question-bars";
import { Button } from "@/components/ui/button";
import { AnalyticsKpiDetailsSheet } from "@/modules/reports/analytics-kpi-details-sheet";

function defaultDates() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export function ReportsView() {
  const searchParams = useSearchParams();
  const defaults = defaultDates();
  const [dateFrom, setDateFrom] = useState(
    searchParams.get("from") || defaults.from
  );
  const [dateTo, setDateTo] = useState(searchParams.get("to") || defaults.to);
  const [surveyId, setSurveyId] = useState(
    searchParams.get("surveyId") || "all"
  );
  const [kpiFilter, setKpiFilter] = useState<AnalyticsKpiFilterId>("total_calls");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsPage, setDetailsPage] = useState(1);

  const { data, isLoading, isFetching, isError, error } = useReports({
    from: dateFrom,
    to: dateTo,
    surveyId: surveyId === "all" ? undefined : surveyId,
  });

  const { data: surveys = [] } = useReportCampaigns();

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Analytics",
    breadcrumbs: [
      { label: "Insights", href: "/analytics" },
      { label: "Analytics" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    if (isError) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load analytics"
      );
    }
  }, [isError, error]);

  useEffect(() => {
    setKpiFilter("total_calls");
    setDetailsOpen(false);
    setDetailsPage(1);
  }, [dateFrom, dateTo, surveyId]);

  const filteredView = useMemo(
    () => (data ? applyKpiFilter(data, kpiFilter) : null),
    [data, kpiFilter]
  );

  const handleKpiSelect = useCallback((id: AnalyticsKpiFilterId) => {
    if (kpiFilter === id && detailsOpen) {
      setKpiFilter("total_calls");
      setDetailsOpen(false);
      setDetailsPage(1);
      return;
    }
    setKpiFilter(id);
    setDetailsOpen(true);
    setDetailsPage(1);
  }, [kpiFilter, detailsOpen]);

  const handlePreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateFrom(from.toISOString().split("T")[0]);
    setDateTo(to.toISOString().split("T")[0]);
  };

  const handleExportPdf = useCallback(async () => {
    if (!data) return;
    try {
      await exportReportsPdf(data);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to export PDF");
    }
  }, [data]);

  const handleExportExcel = useCallback(async () => {
    if (!data) return;
    try {
      await exportReportsExcel(data);
      toast.success("Excel downloaded");
    } catch {
      toast.error("Failed to export Excel");
    }
  }, [data]);

  return (
    <PageContainer size="full" className="pb-5 pt-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="space-y-4"
        id="reports-export-root"
      >
        <ReportsToolbar
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onPreset={handlePreset}
          surveyId={surveyId}
          surveyName={data?.surveyName}
          onSurveyChange={setSurveyId}
          surveys={surveys}
          onExportPdf={handleExportPdf}
          onExportExcel={handleExportExcel}
        />

        <AnalyticsKpiGrid
          kpis={data?.kpis ?? []}
          isLoading={isLoading}
          selectedId={kpiFilter}
          onSelect={handleKpiSelect}
        />

        {kpiFilter !== "total_calls" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-brand/30 bg-brand/8 px-3 py-1 text-xs font-medium text-brand">
              Filter: {KPI_FILTER_LABELS[kpiFilter]}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => {
                setDetailsOpen(true);
                setDetailsPage(1);
              }}
            >
              View client details
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-muted-foreground"
              onClick={() => {
                setKpiFilter("total_calls");
                setDetailsOpen(false);
                setDetailsPage(1);
              }}
            >
              <X className="size-3.5" />
              Clear
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <ReportCallPerformanceBars
              data={filteredView?.callsOverTime ?? data?.callsOverTime ?? []}
              isLoading={isLoading}
              description={filteredView?.barDescription}
              metricLabel={filteredView?.barMetricLabel ?? "calls"}
            />
          </div>
          <div className="xl:col-span-4">
            <ReportDashboardDonut
              data={data?.callOutcomeBreakdown ?? []}
              isLoading={isLoading}
              variant="call"
            />
          </div>
          <div className="xl:col-span-8">
            <ReportHeroChart
              data={filteredView?.trendData ?? data?.callsOverTime ?? []}
              isLoading={isLoading}
              trendMode={filteredView?.trendMode ?? "all"}
              description={filteredView?.trendDescription}
            />
          </div>
          <div className="xl:col-span-4">
            <ReportDashboardDonut
              data={data?.surveyStatusBreakdown ?? []}
              isLoading={isLoading}
              variant="survey"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
          <ReportHeatmap data={data?.heatmap} isLoading={isLoading} />
          <ReportHangupBars
            data={data?.hangupBreakdown ?? []}
            isLoading={isLoading}
          />
          <ReportInsights insights={data?.insights} isLoading={isLoading} />
        </div>

        <ReportQuestionBars
          data={data?.questionBars ?? []}
          isLoading={isLoading}
        />

        {isFetching && !isLoading && (
          <div className="flex justify-center">
            <div className="size-1.5 animate-pulse rounded-full bg-brand" />
          </div>
        )}

        <AnalyticsKpiDetailsSheet
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          metric={kpiFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
          surveyId={surveyId}
          page={detailsPage}
          onPageChange={setDetailsPage}
        />
      </motion.div>
    </PageContainer>
  );
}
