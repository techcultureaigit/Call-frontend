"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity as ActivityIcon,
  LineChart,
  Users2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { PageContainer } from "@/components/layout";
import { useDashboard } from "@/hooks/use-dashboard";
import { usePageMeta } from "@/hooks";
import { KpiGrid } from "./kpi-grid";
import { DailyCallsChart } from "./daily-calls-chart";
import { CampaignPieChart } from "./campaign-pie-chart";
import { CallSuccessChart } from "./call-success-chart";
import { RecentActivities } from "./recent-activities";
import { RecentNotificationsList } from "./recent-notifications-list";
import { TopCampaigns } from "./top-campaigns";
import { RecentCustomers } from "./recent-customers";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { DashboardHeader } from "./dashboard-header";
import { QuickActions } from "./quick-actions";

function SectionLabel({
  children,
  icon: Icon,
}: {
  children: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2.5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand ring-1 ring-inset ring-brand/15">
          <Icon className="size-4" />
        </span>
        <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
          {children}
        </h3>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
    </div>
  );
}

export function DashboardView() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();
  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Dashboard",
    // breadcrumbs: [{ label: "Dashboard" }],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

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
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
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
    <PageContainer size="full">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <DashboardHeader onRefresh={() => refetch()} isRefreshing={isFetching} />

        <KpiGrid kpis={data.kpis} isLoading={isLoading} />

        <div className="space-y-4">
          <SectionLabel icon={Zap}>Quick actions</SectionLabel>
          <QuickActions />
        </div>

        <div className="space-y-4">
          <SectionLabel icon={LineChart}>Performance</SectionLabel>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <DailyCallsChart data={data.dailyCalls} isLoading={isLoading} />
            </div>
            <CampaignPieChart
              data={data.campaignDistribution}
              isLoading={isLoading}
            />
          </div>

          <CallSuccessChart data={data.callSuccessTrend} isLoading={isLoading} />
        </div>

        <div className="space-y-4">
          <SectionLabel icon={Users2}>Campaigns &amp; customers</SectionLabel>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <TopCampaigns campaigns={data.topCampaigns} isLoading={isLoading} />
            <RecentCustomers
              customers={data.recentCustomers}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="space-y-4">
          <SectionLabel icon={ActivityIcon}>Activity feed</SectionLabel>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RecentActivities
              activities={data.recentActivities}
              isLoading={isLoading}
            />
            <RecentNotificationsList
              notifications={data.recentNotifications}
              isLoading={isLoading}
            />
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
}
