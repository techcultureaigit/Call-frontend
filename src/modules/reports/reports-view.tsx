"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { usePageMeta } from "@/hooks";
import {
  useAnalyticsBreakdowns,
  useAnalyticsKpis,
  useAnalyticsTrends,
  useReportCampaigns,
  useQuestionAnalytics,
} from "@/modules/reports/use-reports";
import { exportReportsPdf } from "@/modules/reports/reports-export";
import {
  analyticsDetailsHref,
  analyticsQuestionsHref,
  analyticsSurveysHref,
} from "@/modules/reports/analytics-nav";
import { ReportsToolbar } from "./reports-toolbar";
import { ReportDashboardDonut } from "./report-dashboard-donut";
import { ReportAreaChart } from "./report-area-chart";
import { ReportQuestionAnalytics } from "./report-question-analytics";
import { ReportSurveyBreakdown } from "./report-survey-breakdown";
import { AnalyticsReportSections } from "./analytics-report-sections";
import { useAnalyticsReportLayout } from "./use-analytics-report-layout";
import type { AnalyticsSectionId } from "./analytics-report-layout";
import type { AnalyticsKpiFilterId } from "@/modules/reports/analytics-kpi-filter";
import {
  AnalyticsKpiGrid,
  KpiCardBody,
  findOrderedKpi,
} from "@/modules/reports/analytics-kpi-grid";

function toLocalDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function defaultDates() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: toLocalDateKey(from),
    to: toLocalDateKey(to),
  };
}

export function ReportsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaults = defaultDates();
  const [dateFrom, setDateFrom] = useState(
    searchParams.get("from") || defaults.from
  );
  const [dateTo, setDateTo] = useState(searchParams.get("to") || defaults.to);
  const [surveyId, setSurveyId] = useState(
    searchParams.get("surveyId") || "all"
  );

  const {
    layout,
    reorderMode,
    setReorderMode,
    reorderSections,
    reorderKpis,
    resetLayout,
  } = useAnalyticsReportLayout();

  const filterParams = {
    from: dateFrom,
    to: dateTo,
    surveyId: surveyId === "all" ? undefined : surveyId,
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

  /** By-survey table always compares all surveys — not scoped to the toolbar filter */
  const {
    data: surveysBreakdownData,
    isLoading: surveysBreakdownLoading,
  } = useAnalyticsBreakdowns({
    from: dateFrom,
    to: dateTo,
  });

  const {
    data: trendsData,
    isLoading: trendsLoading,
    isError: trendsError,
    error: trendsErr,
  } = useAnalyticsTrends(filterParams);

  const {
    data: questionData,
    isLoading: questionsLoading,
    isError: questionsError,
    error: questionsErr,
  } = useQuestionAnalytics(filterParams);

  const { data: surveys = [] } = useReportCampaigns();

  const isLoading = kpisLoading || breakdownsLoading || trendsLoading;
  const isFetching = kpisFetching;
  const surveyName = kpisData?.surveyName ?? breakdownsData?.surveyName;

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Analytics Report",
    breadcrumbs: [
      { label: "Insights", href: "/analytics" },
      { label: "Analytics Report" },
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
          : "Failed to load survey breakdown"
      );
    }
  }, [breakdownsError, breakdownsErr]);

  useEffect(() => {
    if (trendsError) {
      toast.error(
        trendsErr instanceof Error ? trendsErr.message : "Failed to load trends"
      );
    }
  }, [trendsError, trendsErr]);

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
    if (!kpisData || !breakdownsData || !trendsData) return null;
    const questions = questionData?.questions ?? [];
    return {
      dateRange: kpisData.dateRange,
      surveyId: kpisData.surveyId,
      surveyName: kpisData.surveyName,
      kpis: kpisData.kpis,
      calls: breakdownsData.calls,
      survey: breakdownsData.survey,
      duration: breakdownsData.duration,
      recording: breakdownsData.recording,
      callsOverTime: trendsData.callsOverTime,
      completionTrend: trendsData.completionTrend,
      successRateTrend: trendsData.completionTrend,
      responsesBySurvey: surveysBreakdownData?.responsesBySurvey ?? breakdownsData.responsesBySurvey,
      responsesByCampaign: [],
      callOutcomeBreakdown: breakdownsData.callOutcomeBreakdown,
      surveyStatusBreakdown: breakdownsData.surveyStatusBreakdown,
      campaignBreakdown: breakdownsData.responsesBySurvey.slice(0, 8).map((row, i) => ({
        name: row.name,
        value: row.completionRate,
        count: row.total,
        fill: `var(--chart-${(i % 5) + 1})`,
      })),
      hangupBreakdown: [],
      sentimentBreakdown: breakdownsData.surveyStatusBreakdown,
      insights: [],
      questions,
      questionBars: questions.map((q, i) => ({
        label: `Q${i + 1}`,
        fullLabel: q.question,
        questionId: q.questionId,
        answered: q.answered,
        unanswered: q.unanswered,
        value: q.answered,
        counting: q.counting,
        answerRate: q.answerRate,
      })),
    };
  }, [kpisData, breakdownsData, trendsData, questionData, surveysBreakdownData]);

  const openMetricPage = useCallback(
    (id: AnalyticsKpiFilterId) => {
      router.push(
        analyticsDetailsHref({
          metric: id,
          from: dateFrom,
          to: dateTo,
          surveyId,
        })
      );
    },
    [router, dateFrom, dateTo, surveyId]
  );

  const openQuestionsPage = useCallback(
    (questionId?: string) => {
      router.push(
        analyticsQuestionsHref({
          from: dateFrom,
          to: dateTo,
          surveyId,
          questionId,
        })
      );
    },
    [router, dateFrom, dateTo, surveyId]
  );

  const openSurveysPage = useCallback(() => {
    router.push(
      analyticsSurveysHref({
        from: dateFrom,
        to: dateTo,
        surveyId,
      })
    );
  }, [router, dateFrom, dateTo, surveyId]);

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
        case "completion_trend":
          return (
            <ReportAreaChart
              data={trendsData?.completionTrend ?? []}
              isLoading={trendsLoading}
            />
          );
        case "survey_breakdown":
          return (
            <ReportSurveyBreakdown
              data={surveysBreakdownData?.responsesBySurvey ?? []}
              isLoading={surveysBreakdownLoading}
              onSurveySelect={reorderMode ? undefined : setSurveyId}
              onOpenFullPage={reorderMode ? undefined : openSurveysPage}
            />
          );
        case "question_analytics":
          return (
            <ReportQuestionAnalytics
              data={questionData?.questions ?? []}
              totalQuestions={questionData?.totalQuestions}
              totalAnswers={questionData?.totalAnswers}
              surveyId={surveyId}
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
      breakdownsLoading,
      kpisData?.kpis,
      kpisLoading,
      layout.kpis,
      openMetricPage,
      openQuestionsPage,
      openSurveysPage,
      questionData?.questions,
      questionData?.totalAnswers,
      questionData?.totalQuestions,
      questionsLoading,
      reorderMode,
      surveysBreakdownData?.responsesBySurvey,
      surveysBreakdownLoading,
      surveyId,
      trendsData?.completionTrend,
      trendsLoading,
    ]
  );

  return (
    <PageContainer size="full" className="pb-5 pt-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="space-y-5"
        id="reports-export-root"
      >
        <ReportsToolbar
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          surveyId={surveyId}
          surveyName={surveyName}
          onSurveyChange={setSurveyId}
          surveys={surveys}
          onExportPdf={handleExportPdf}
          reorderMode={reorderMode}
          onReorderModeChange={setReorderMode}
          onResetLayout={resetLayout}
        />

        {reorderMode ? (
          <p className="rounded-[6px] border border-dashed border-brand/25 bg-brand/5 px-3 py-2 text-xs text-muted-foreground">
            Use the dashed bar grip to move a whole block. Drag inside KPI cards to
            swap them. Click{" "}
            <span className="font-medium text-foreground">Done</span> when finished.
          </p>
        ) : null}

        <AnalyticsReportSections
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
              <div className="w-[min(240px,28vw)] cursor-grabbing">
                <KpiCardBody kpi={kpi} reorderMode isDragging />
              </div>
            );
          }}
        />

        {isFetching && !isLoading && (
          <div className="flex justify-center">
            <div className="size-1.5 animate-pulse rounded-full bg-brand" />
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
