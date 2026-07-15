"use client";

import { Megaphone } from "lucide-react";
import { ListSkeleton } from "./dashboard-skeleton";
import { DashboardCard } from "./dashboard-card";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, formatCompactNumber, formatPercent } from "@/lib/utils";
import type { TopCampaign } from "@/types/dashboard";

const statusStyles: Record<TopCampaign["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  paused: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  draft: "bg-muted text-muted-foreground",
};

interface TopCampaignsProps {
  campaigns: TopCampaign[];
  isLoading?: boolean;
}

export function TopCampaigns({ campaigns, isLoading }: TopCampaignsProps) {
  if (isLoading) {
    return (
      <DashboardCard title="Top Campaigns" description="Highest performing campaigns">
        <ListSkeleton rows={5} />
      </DashboardCard>
    );
  }

  if (campaigns.length === 0) {
    return (
      <DashboardCard title="Top Campaigns" description="Highest performing campaigns">
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
    <DashboardCard title="Top Campaigns" description="Highest performing campaigns">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-border/60 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="pb-3 pr-4 font-semibold">Campaign</th>
              <th className="pb-3 pr-4 font-semibold">Status</th>
              <th className="pb-3 pr-4 text-right font-semibold">Calls</th>
              <th className="pb-3 pr-4 text-right font-semibold">Success</th>
              <th className="pb-3 text-right font-semibold">Responses</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="border-b border-border/30 transition-colors last:border-0 hover:bg-muted/30"
              >
                <td className="py-3 pr-4">
                  <span className="text-sm font-medium">{campaign.name}</span>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize",
                      statusStyles[campaign.status]
                    )}
                  >
                    {campaign.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right text-sm tabular-nums text-muted-foreground">
                  {formatCompactNumber(campaign.calls)}
                </td>
                <td className="py-3 pr-4 text-right text-sm tabular-nums font-medium">
                  {formatPercent(campaign.successRate)}
                </td>
                <td className="py-3 text-right text-sm tabular-nums text-muted-foreground">
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
