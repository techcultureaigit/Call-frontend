"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
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

export function DashboardView() {
  const { data, isLoading, isError } = useDashboard();
  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Dashboard",
    breadcrumbs: [{ label: "Dashboard" }],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  if (isLoading && !data) {
    return (
      <PageContainer size="wide">
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer size="wide">
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
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Overview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor calls, campaigns, and customer engagement at a glance.
          </p>
        </div>

        <KpiGrid kpis={data.kpis} isLoading={isLoading} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DailyCallsChart data={data.dailyCalls} isLoading={isLoading} />
          </div>
          <CampaignPieChart
            data={data.campaignDistribution}
            isLoading={isLoading}
          />
        </div>

        <CallSuccessChart
          data={data.callSuccessTrend}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentActivities
            activities={data.recentActivities}
            isLoading={isLoading}
          />
          <RecentNotificationsList
            notifications={data.recentNotifications}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TopCampaigns campaigns={data.topCampaigns} isLoading={isLoading} />
          <RecentCustomers
            customers={data.recentCustomers}
            isLoading={isLoading}
          />
        </div>
      </motion.div>
    </PageContainer>
  );
}
