"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { usePageMeta } from "@/hooks";
import { useReports, useReportCampaigns } from "@/hooks/use-reports";
import {
  exportReportsExcel,
  exportReportsPdf,
} from "@/lib/utils/reports-export";
import { ReportsToolbar } from "./reports-toolbar";
import { ReportsKpiGrid } from "./reports-kpi-grid";
import { ReportLineChart } from "./report-line-chart";
import { ReportBarChart } from "./report-bar-chart";
import { ReportAreaChart } from "./report-area-chart";
import { ReportPieChart } from "./report-pie-chart";

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
  const defaults = defaultDates();
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [campaignId, setCampaignId] = useState("all");

  const { data, isLoading, isFetching } = useReports({
    from: dateFrom,
    to: dateTo,
    campaignId: campaignId === "all" ? undefined : campaignId,
  });

  const { data: campaigns = [] } = useReportCampaigns();

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Reports",
    breadcrumbs: [
      { label: "Insights", href: "/reports" },
      { label: "Analytics" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const handlePreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateFrom(from.toISOString().split("T")[0]);
    setDateTo(to.toISOString().split("T")[0]);
  };

  const handleExportPdf = useCallback(() => {
    if (!data) return;
    exportReportsPdf(data);
    toast.success("PDF export opened — use Save as PDF in print dialog");
  }, [data]);

  const handleExportExcel = useCallback(() => {
    if (!data) return;
    exportReportsExcel(data);
    toast.success("Excel file downloaded");
  }, [data]);

  return (
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
        id="reports-export-root"
      >
        <ReportsToolbar
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onPreset={handlePreset}
          campaignId={campaignId}
          onCampaignChange={setCampaignId}
          campaigns={campaigns}
          onExportPdf={handleExportPdf}
          onExportExcel={handleExportExcel}
        />

        <ReportsKpiGrid kpis={data?.kpis ?? []} isLoading={isLoading} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ReportLineChart
            data={data?.callsOverTime ?? []}
            isLoading={isLoading}
          />
          <ReportAreaChart
            data={data?.successRateTrend ?? []}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ReportBarChart
              data={data?.responsesByCampaign ?? []}
              isLoading={isLoading}
            />
          </div>
          <ReportPieChart
            data={data?.campaignBreakdown ?? []}
            title="Campaign Mix"
            description="Distribution by type — Pie chart"
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ReportPieChart
            data={data?.sentimentBreakdown ?? []}
            title="Sentiment Analysis"
            description="AI-classified response sentiment"
            isLoading={isLoading}
          />
        </div>

        {isFetching && !isLoading && (
          <div className="flex justify-center">
            <div className="size-1.5 animate-pulse rounded-full bg-primary" />
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
