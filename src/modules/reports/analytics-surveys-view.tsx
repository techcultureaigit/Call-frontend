"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Layers, Search } from "lucide-react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { PAGE_TITLE_CLASS } from "@/components/shared/page-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta } from "@/hooks";
import { useAnalyticsBreakdowns } from "@/modules/reports/use-reports";
import {
  analyticsHomeHref,
  analyticsSurveysHref,
} from "@/modules/reports/analytics-nav";
import {
  SurveyBreakdownTable,
} from "@/modules/reports/report-survey-breakdown";
import { cn } from "@/lib/utils";
import { AnalyticsBadge } from "@/modules/reports/analytics-card";

export function AnalyticsSurveysView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";
  const surveyId = searchParams.get("surveyId") || "all";
  const [search, setSearch] = useState("");

  const backHref = analyticsHomeHref({
    from: dateFrom || undefined,
    to: dateTo || undefined,
    surveyId,
  });

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Survey breakdown",
    breadcrumbs: [
      { label: "Insights", href: "/analytics" },
      { label: "Analytics Report", href: backHref },
      { label: "Surveys" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const { data, isLoading } = useAnalyticsBreakdowns({
    from: dateFrom || undefined,
    to: dateTo || undefined,
  });

  const rows = useMemo(() => {
    const list = [...(data?.responsesBySurvey ?? [])].sort(
      (a, b) => (b.total ?? b.value) - (a.total ?? b.value)
    );
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) => row.name.toLowerCase().includes(q));
  }, [data?.responsesBySurvey, search]);

  const summary = useMemo(() => {
    const all = data?.responsesBySurvey ?? [];
    let complete = 0;
    let partial = 0;
    let incomplete = 0;
    for (const row of all) {
      complete += row.complete ?? 0;
      partial += row.partially_complete ?? 0;
      incomplete += row.incomplete ?? 0;
    }
    return {
      surveys: all.length,
      calls: all.reduce((sum, row) => sum + (row.total ?? row.value), 0),
      complete,
      partial,
      incomplete,
    };
  }, [data?.responsesBySurvey]);

  const selectSurvey = (id: string) => {
    router.push(
      analyticsSurveysHref({
        from: dateFrom || undefined,
        to: dateTo || undefined,
        surveyId: id,
      })
    );
  };

  return (
    <PageContainer size="full" className="pb-8 pt-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-5"
      >
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to analytics
          </Link>
          <h1 className={cn(PAGE_TITLE_CLASS, "mt-2")}>
            By survey
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All surveys — complete + partial + incomplete = total calls
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-[5px] border border-border/55 bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
              {dateFrom && dateTo ? `${dateFrom} — ${dateTo}` : "Selected period"}
            </span>
            {data?.surveyName && surveyId !== "all" ? (
              <span className="rounded-[5px] border border-violet-500/25 bg-violet-500/8 px-2 py-1 text-xs font-medium text-violet-800 dark:text-violet-200">
                {data.surveyName}
              </span>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-[400px] w-full rounded-[10px]" />
        ) : !rows.length && !search ? (
          <div className="flex flex-col items-center justify-center rounded-[10px] border border-border/55 bg-card py-20 text-center">
            <Layers className="size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-foreground">
              No survey data for this period
            </p>
            <Link href={backHref} className="mt-4 text-xs font-medium text-brand hover:underline">
              Back to analytics
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[10px] border border-border/55 bg-card shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/45 px-4 py-4 sm:px-5">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {rows.length}
                  {search ? ` of ${summary.surveys}` : ""} surveys
                </p>
                <p className="text-xs text-muted-foreground">
                  Counts shown as % of each survey&apos;s total calls
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <AnalyticsBadge value={summary.calls} label="Calls" tone="brand" />
                <AnalyticsBadge value={summary.complete} label="Complete" tone="emerald" />
                <AnalyticsBadge value={summary.partial} label="Partial" tone="violet" />
              </div>
            </div>

            <div className="border-b border-border/45 px-4 py-3 sm:px-5">
              <div className="relative max-w-md">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search survey name..."
                  className="h-9 w-full rounded-[6px] border border-border/55 bg-card pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-3 px-4 pt-3 text-[10px] text-muted-foreground sm:px-5">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" /> Complete
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-violet-500" /> Partial
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-500" /> Incomplete
              </span>
            </div>

            <div className="px-4 pb-5 sm:px-5">
              {rows.length ? (
                <SurveyBreakdownTable
                  rows={rows}
                  onSurveySelect={selectSurvey}
                  selectedSurveyId={surveyId !== "all" ? surveyId : undefined}
                />
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No surveys match your search
                </p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
