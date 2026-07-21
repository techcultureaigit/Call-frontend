"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Activity as ActivityIcon,
  ClipboardList,
  Headphones,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { PageContainer } from "@/components/layout";
import { useDashboard } from "@/hooks/use-dashboard";
import { usePageMeta } from "@/hooks";
import { KpiModule } from "./kpi-grid";
import { DailyCallsChart } from "./daily-calls-chart";
import { CallSuccessChart } from "./call-success-chart";
import { CallOutcomeChart } from "./call-outcome-chart";
import { RecentActivities } from "./recent-activities";
import { RecentNotificationsList } from "./recent-notifications-list";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { DashboardHeader } from "./dashboard-header";
import { QuickActions } from "./quick-actions";

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-7 items-center justify-center rounded-[6px] bg-gradient-to-br from-brand/15 to-brand-blue/10 text-brand ring-1 ring-inset ring-brand/15">
        <Icon className="size-3.5" />
      </span>
      <h3 className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h3>
    </div>
  );
}

function Section({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="space-y-3"
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

  const studioKpis = useMemo(
    () =>
      (data?.kpis ?? []).filter((k) =>
        [
          "survey-completed",
          "survey-created",
          "captured-data",
          "survey-pending",
          "survey-ongoing",
          "survey-responses",
        ].includes(k.id)
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
          <div className="flex flex-col gap-4">
            <KpiModule
              title="Survey Studio"
              description="Survey status, creation, and captured data"
              icon={ClipboardList}
              kpis={studioKpis}
              isLoading={isLoading}
              variant="studio"
            />
          </div>
        </Section>

        <Section delay={0.08}>
         
          <QuickActions />
        </Section>

        <Section delay={0.12}>
       
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
          <CallSuccessChart
            data={data.callSuccessTrend}
            isLoading={isLoading}
          />
        </Section>

        <Section delay={0.16}>
          <SectionHeading icon={ActivityIcon} title="Recent activity" />
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
