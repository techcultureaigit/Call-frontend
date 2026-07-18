"use client";

import Link from "next/link";
import { ArrowUpRight, Megaphone } from "lucide-react";
import { ListSkeleton } from "./dashboard-skeleton";
import { DashboardCard } from "./dashboard-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { cn, formatCompactNumber, formatPercent } from "@/lib/utils";
import type { TopCampaign } from "@/types/dashboard";

const statusStyles: Record<TopCampaign["status"], string> = {
  active:
    "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  paused: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  completed: "bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:text-blue-400",
  draft: "bg-muted text-muted-foreground ring-border/60",
};

interface TopCampaignsProps {
  campaigns: TopCampaign[];
  isLoading?: boolean;
}

function SuccessMeter({ value }: { value: number }) {
  const tone =
    value >= 80
      ? "bg-emerald-500"
      : value >= 70
        ? "bg-amber-500"
        : "bg-rose-500";

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block">
        <div
          className={cn("h-full rounded-full", tone)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="w-9 text-right text-sm font-medium tabular-nums">
        {formatPercent(value)}
      </span>
    </div>
  );
}

export function TopCampaigns({ campaigns, isLoading }: TopCampaignsProps) {
  if (isLoading) {
    return (
      <DashboardCard
        title="Top Campaigns"
        description="Highest performing campaigns"
        icon={Megaphone}
      >
        <ListSkeleton rows={5} />
      </DashboardCard>
    );
  }

  if (campaigns.length === 0) {
    return (
      <DashboardCard
        title="Top Campaigns"
        description="Highest performing campaigns"
        icon={Megaphone}
      >
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Create a campaign to start tracking performance."
          compact
        />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Top Campaigns"
      description="Highest performing campaigns"
      icon={Megaphone}
      contentClassName="pt-0"
      action={
        <Button asChild variant="ghost" size="sm" className="rounded-lg">
          <Link href="/campaigns">
            View all
            <ArrowUpRight />
          </Link>
        </Button>
      }
    >
      <div className="max-h-[340px] overflow-auto scrollbar-thin">
        <table className="w-full min-w-[440px] border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground [&>th]:border-b [&>th]:border-border/60 [&>th]:bg-card [&>th]:pb-3 [&>th]:pt-4">
              <th className="pr-4">Campaign</th>
              <th className="pr-4">Status</th>
              <th className="pr-4 text-right">Calls</th>
              <th className="pr-4 text-right">Success</th>
              <th className="text-right">Responses</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="group transition-colors hover:bg-muted/40"
              >
                <td className="border-b border-border/30 py-3 pr-4">
                  <span className="text-sm font-medium text-foreground">
                    {campaign.name}
                  </span>
                </td>
                <td className="border-b border-border/30 py-3 pr-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset",
                      statusStyles[campaign.status]
                    )}
                  >
                    {campaign.status}
                  </span>
                </td>
                <td className="border-b border-border/30 py-3 pr-4 text-right text-sm tabular-nums text-muted-foreground">
                  {formatCompactNumber(campaign.calls)}
                </td>
                <td className="border-b border-border/30 py-3 pr-4">
                  <SuccessMeter value={campaign.successRate} />
                </td>
                <td className="border-b border-border/30 py-3 text-right text-sm tabular-nums text-muted-foreground">
                  {formatCompactNumber(campaign.responses)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
