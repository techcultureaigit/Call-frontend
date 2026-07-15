"use client";

import {
  Activity,
  Mail,
  MessageSquare,
  Phone,
  StickyNote,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { ListSkeleton } from "./dashboard-skeleton";
import { DashboardCard } from "./dashboard-card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ActivityType } from "@/types/activity";
import type { DashboardActivity } from "@/types/dashboard";

const activityIcons: Record<ActivityType, LucideIcon> = {
  call: Phone,
  email: Mail,
  meeting: MessageSquare,
  note: StickyNote,
  task: Activity,
  deal_update: TrendingUp,
  status_change: Activity,
};

interface RecentActivitiesProps {
  activities: DashboardActivity[];
  isLoading?: boolean;
}

export function RecentActivities({ activities, isLoading }: RecentActivitiesProps) {
  if (isLoading) {
    return (
      <DashboardCard title="Recent Activities" description="Latest team actions">
        <ListSkeleton rows={5} />
      </DashboardCard>
    );
  }

  if (activities.length === 0) {
    return (
      <DashboardCard title="Recent Activities" description="Latest team actions">
        <EmptyState
          icon={Activity}
          title="No recent activity"
          description="Team actions and updates will show up here."
          compact
        />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Recent Activities" description="Latest team actions">
      <ul className="space-y-1">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type] ?? Activity;

          return (
            <li
              key={activity.id}
              className={cn(
                "flex gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40",
                index !== activities.length - 1 && "border-b border-border/40"
              )}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{activity.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {activity.description}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground/70">
                  <span>{activity.performedBy}</span>
                  <span>·</span>
                  <span>{formatRelativeTime(activity.occurredAt)}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
