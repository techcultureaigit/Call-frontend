"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { useDashboard } from "@/modules/dashboard/use-dashboard";
import { usePageMeta } from "@/hooks";
import { MetricBox } from "./kpi-card";
import { DailyCallsChart } from "./daily-calls-chart";
import { CallOutcomeChart } from "./call-outcome-chart";
import { RecentActivities } from "./recent-activities";
import { RecentNotificationsList } from "./recent-notifications-list";
import { DashboardSkeleton, KpiGridSkeleton } from "./dashboard-skeleton";
import { DashboardHeader } from "./dashboard-header";

const DASHBOARD_KPI_IDS = [
  "survey-completed",
  "response-rate",
  "reach-rate",
  "total-contacts",
  "engaged-rate",
  "conversion-rate",
] as const;

function Section({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

export function DashboardView() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();
  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Dashboard",
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const overviewKpis = useMemo(
    () =>
      DASHBOARD_KPI_IDS.map((id) => data?.kpis.find((k) => k.id === id)).filter(
        (k): k is NonNullable<typeof k> => Boolean(k)
      ),
    [data?.kpis]
  );

  if (isLoading && !data) {
    return (
      <PageContainer size="full">
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer size="full">
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-destructive">
            Failed to load dashboard
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Please refresh the page or try again later.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="full" className="pb-6">
      <div className="flex flex-col gap-5">
        <Section delay={0}>
          <DashboardHeader
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
          />
        </Section>

        <Section delay={0.04}>
          {isLoading ? (
            <KpiGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {overviewKpis.map((kpi, index) => (
                <MetricBox key={kpi.id} kpi={kpi} index={index} />
              ))}
            </div>
          )}
        </Section>

        <Section delay={0.08}>
          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-3">
            <div className="h-full xl:col-span-2">
              <DailyCallsChart data={data.dailyCalls} isLoading={isLoading} />
            </div>
            <div className="h-full">
              <CallOutcomeChart
                data={data.callOutcomes}
                isLoading={isLoading}
              />
            </div>
          </div>
        </Section>

        <Section delay={0.12}>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <RecentActivities
              activities={data.recentActivities}
              isLoading={isLoading}
            />
            <RecentNotificationsList
              notifications={data.recentNotifications}
              isLoading={isLoading}
            />
          </div>
        </Section>
      </div>
    </PageContainer>
  );
}
