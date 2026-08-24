"use client";

import { motion } from "framer-motion";
import {
  Globe,
  Monitor,
  ScrollText,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { ActivityLogActionBadge } from "./activity-log-action-badge";
import { ActivityLogModuleBadge } from "./activity-log-module-badge";
import { ActivityLogChanges } from "./activity-log-changes";
import type { ActivityLog } from "@/types/activity-log";

interface ActivityLogsTimelineProps {
  logs: ActivityLog[];
  isLoading?: boolean;
  onItemClick: (log: ActivityLog) => void;
}

export function ActivityLogsTimeline({
  logs,
  isLoading,
  onItemClick,
}: ActivityLogsTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 rounded-[6px] border border-border/60 bg-card p-6 shadow-card">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-[6px] border border-border/60 bg-card shadow-card">
        <EmptyState
          icon={ScrollText}
          title="No activity logs found"
          description="Try adjusting your search or filters."
        />
      </div>
    );
  }

  return (
    <div className="rounded-[6px] border border-border/60 bg-card p-4 shadow-card sm:p-6">
      <div className="space-y-0">
        {logs.map((log, index) => {
          const [first, last] = log.performedBy.name.split(" ");
          const isLast = index === logs.length - 1;

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {!isLast && (
                <div className="absolute left-[15px] top-10 h-[calc(100%-16px)] w-px bg-border/60" />
              )}

              <Avatar className="relative z-10 size-8 shrink-0">
                <AvatarFallback className="bg-primary/8 text-[10px] font-medium text-primary">
                  {getInitials(first, last ?? "")}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                onClick={() => onItemClick(log)}
                className="min-w-0 flex-1 rounded-[6px] border border-border/50 bg-muted/10 p-4 text-left transition-colors hover:border-border hover:bg-muted/25"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ActivityLogActionBadge action={log.action} />
                  <ActivityLogModuleBadge module={log.module} />
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelativeTime(log.occurredAt)}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold">{log.summary}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {log.performedBy.name} · {log.resourceName}
                </p>

                {log.description && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {log.description}
                  </p>
                )}

                {log.changes.length > 0 && (
                  <div className="mt-3">
                    <ActivityLogChanges changes={log.changes} compact />
                  </div>
                )}

                {(log.ipAddress || log.userAgent) && (
                  <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground/70">
                    {log.ipAddress && (
                      <span className="inline-flex items-center gap-1">
                        <Globe className="size-3" />
                        {log.ipAddress}
                      </span>
                    )}
                    {log.userAgent && (
                      <span className="inline-flex items-center gap-1">
                        <Monitor className="size-3" />
                        {log.userAgent}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
