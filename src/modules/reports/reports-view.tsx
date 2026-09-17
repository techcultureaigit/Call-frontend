"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { usePageMeta } from "@/hooks";
import {
  useAnalyticsBreakdowns,
  useAnalyticsKpis,
  useQuestionAnalytics,
} from "@/modules/reports/use-reports";
import { exportReportsPdf } from "@/modules/reports/reports-export";
import {
  analyticsDetailsHref,
  analyticsQuestionsHref,
} from "@/modules/reports/analytics-nav";
import { ReportsToolbar } from "./reports-toolbar";
import { ReportDashboardDonut } from "./report-dashboard-donut";
import { ReportQuestionAnalytics } from "./report-question-analytics";
import { AnalyticsReportSections } from "./analytics-report-sections";
import { useAnalyticsReportLayout } from "./use-analytics-report-layout";
import type { AnalyticsSectionId } from "./analytics-report-layout";
import type { AnalyticsKpiFilterId } from "@/modules/reports/analytics-kpi-filter";
import {
  AnalyticsKpiGrid,
  KpiCardBody,
  findOrderedKpi,
} from "@/modules/reports/analytics-kpi-grid";

export function ReportsView({ lockedSurveyId }: { lockedSurveyId: string }) {
  const router = useRouter();

  const {
    layout,
    reorderMode,
    setReorderMode,
    reorderSections,
    reorderKpis,
    resetLayout,
  } = useAnalyticsReportLayout();

  const filterParams = {
    surveyId: lockedSurveyId,
  };

  const {
    data: kpisData,
    isLoading: kpisLoading,
    isFetching: kpisFetching,
    isError: kpisError,
    error: kpisErr,
  } = useAnalyticsKpis(filterParams);

  const {
    data: breakdownsData,
    isLoading: breakdownsLoading,
    isError: breakdownsError,
    error: breakdownsErr,
  } = useAnalyticsBreakdowns(filterParams);

  const {
    data: questionData,
    isLoading: questionsLoading,
    isError: questionsError,
    error: questionsErr,
  } = useQuestionAnalytics(filterParams);

  const isLoading = kpisLoading || breakdownsLoading;
  const isFetching = kpisFetching;
  const surveyName = kpisData?.surveyName ?? breakdownsData?.surveyName;
  const totalCalls = Number(
    kpisData?.kpis?.find((kpi) => kpi.id === "total_calls")?.value ?? NaN
  );

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: surveyName ? `${surveyName} · Analytics` : "Survey analytics",
    breadcrumbs: [
      { label: "My Surveys", href: "/survey" },
      {
        label: surveyName || "Survey",
        href: `/survey/${lockedSurveyId}`,
      },
      { label: "Analytics" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    if (kpisError) {
      toast.error(
        kpisErr instanceof Error ? kpisErr.message : "Failed to load KPIs"
      );
    }
  }, [kpisError, kpisErr]);

  useEffect(() => {
    if (breakdownsError) {
      toast.error(
        breakdownsErr instanceof Error
          ? breakdownsErr.message
          : "Failed to load analytics"
      );
    }
  }, [breakdownsError, breakdownsErr]);

  useEffect(() => {
    if (questionsError) {
      toast.error(
        questionsErr instanceof Error
          ? questionsErr.message
          : "Failed to load question analytics"
      );
    }
  }, [questionsError, questionsErr]);

  const exportPayload = useMemo(() => {
    if (!kpisData || !breakdownsData) return null;
    return {
      dateRange: kpisData.dateRange,
      surveyName: kpisData.surveyName,
      surveyDates: kpisData.surveyDates ?? null,
      kpis: kpisData.kpis ?? [],
      surveyStatusBreakdown: breakdownsData.surveyStatusBreakdown ?? [],
      reasonBreakdown: breakdownsData.reasonBreakdown ?? [],
      questions: questionData?.questions ?? [],
      totalQuestions: questionData?.totalQuestions,
      totalAnswers: questionData?.totalAnswers,
    };
  }, [kpisData, breakdownsData, questionData]);

  const openMetricPage = useCallback(
    (id: AnalyticsKpiFilterId) => {
      router.push(
        analyticsDetailsHref({
          metric: id,
          surveyId: lockedSurveyId,
        })
      );
    },
    [router, lockedSurveyId]
  );

  const openQuestionsPage = useCallback(
    (questionId?: string) => {
      router.push(
        analyticsQuestionsHref({
          surveyId: lockedSurveyId,
          questionId,
        })
      );
    },
    [router, lockedSurveyId]
  );

  const handleExportPdf = useCallback(async () => {
    if (!exportPayload) {
      toast.error("Report data is still loading");
      return;
    }
    try {
      await exportReportsPdf(exportPayload);
      toast.success("PDF downloaded");
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to export PDF"
      );
    }
  }, [exportPayload]);

  const renderSection = useCallback(
    (sectionId: AnalyticsSectionId) => {
      switch (sectionId) {
        case "kpis":
          return (
            <AnalyticsKpiGrid
              kpis={kpisData?.kpis ?? []}
              isLoading={kpisLoading}
              onSelect={reorderMode ? undefined : openMetricPage}
              order={layout.kpis}
              reorderMode={reorderMode}
            />
          );
        case "survey_status":
          return (
            <ReportDashboardDonut
              data={breakdownsData?.surveyStatusBreakdown ?? []}
              isLoading={breakdownsLoading}
              variant="survey"
              onSliceSelect={reorderMode ? undefined : openMetricPage}
            />
          );
        case "disconnect_reason":
          return (
            <ReportDashboardDonut
              data={breakdownsData?.reasonBreakdown ?? []}
              isLoading={breakdownsLoading}
              variant="reason"
            />
          );
        case "question_analytics":
          return (
            <ReportQuestionAnalytics
              data={questionData?.questions ?? []}
              totalQuestions={questionData?.totalQuestions}
              totalAnswers={questionData?.totalAnswers}
              surveyId={lockedSurveyId}
              isLoading={questionsLoading}
              onOpenFullPage={reorderMode ? undefined : openQuestionsPage}
              onQuestionOpen={reorderMode ? undefined : openQuestionsPage}
            />
          );
        default:
          return null;
      }
    },
    [
      breakdownsData?.surveyStatusBreakdown,
      breakdownsData?.reasonBreakdown,
      breakdownsLoading,
      kpisData?.kpis,
      kpisLoading,
      layout.kpis,
      lockedSurveyId,
      openMetricPage,
      openQuestionsPage,
      questionData?.questions,
      questionData?.totalAnswers,
      questionData?.totalQuestions,
      questionsLoading,
      reorderMode,
    ]
  );

  return (
    <PageContainer
      size="full"
      fullHeight
      className="relative w-full max-w-none px-3 lg:px-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 pb-4 font-sans text-[13px]"
        id="reports-export-root"
      >
        <div className="shrink-0">
          <ReportsToolbar
            surveyId={lockedSurveyId}
            surveyName={surveyName}
            surveyDates={kpisData?.surveyDates}
            totalCalls={Number.isFinite(totalCalls) ? totalCalls : undefined}
            lockedSurveyId={lockedSurveyId}
            onExportPdf={handleExportPdf}
            reorderMode={reorderMode}
            onReorderModeChange={setReorderMode}
            onResetLayout={resetLayout}
          />
        </div>

        {reorderMode ? (
          <p className="shrink-0 rounded-[6px] border border-dashed border-brand/25 bg-brand/5 px-3 py-2 text-xs text-muted-foreground">
            Use the dashed bar grip to move a whole block. Drag KPI cards to
            swap them. Click{" "}
            <span className="font-medium text-foreground">Done</span> when finished.
          </p>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AnalyticsReportSections
            fillHeight
            sectionOrder={layout.sections}
            reorderMode={reorderMode}
            onReorderSections={reorderSections}
            onReorderKpis={reorderKpis}
            renderSection={renderSection}
            renderKpiOverlay={(kpiId) => {
              const kpi = findOrderedKpi(
                kpisData?.kpis ?? [],
                layout.kpis,
                kpiId
              );
              if (!kpi) return null;
              return (
                <div className="w-[min(220px,30vw)] cursor-grabbing">
                  <KpiCardBody kpi={kpi} reorderMode isDragging />
                </div>
              );
            }}
          />
        </div>

        {isFetching && !isLoading ? (
          <div className="pointer-events-none absolute right-6 top-3 size-1.5 animate-pulse rounded-full bg-brand" />
        ) : null}
      </motion.div>
    </PageContainer>
  );
}
