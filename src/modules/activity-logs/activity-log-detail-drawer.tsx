"use client";

import { Globe, Monitor } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { ActivityLogActionBadge } from "./activity-log-action-badge";
import { ActivityLogModuleBadge } from "./activity-log-module-badge";
import { ActivityLogChanges } from "./activity-log-changes";
import type { ActivityLog } from "@/types/activity-log";

export function ActivityLogDetailDrawer({
  log,
  open,
  onOpenChange,
}: {
  log: ActivityLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!log) return null;

  const [first, last] = log.performedBy.name.split(" ");

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-lg md:max-w-xl lg:max-w-2xl"
    >
      <SheetHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-start gap-4">
          <Avatar className="size-12">
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {getInitials(first, last ?? "")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">{log.summary}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {log.performedBy.name} · {log.performedBy.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ActivityLogActionBadge action={log.action} />
              <ActivityLogModuleBadge module={log.module} />
            </div>
          </div>
        </div>
      </SheetHeader>

      <SheetContent className="space-y-6">
        <div className="grid gap-3 rounded-[6px] border border-border/60 bg-muted/20 p-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Resource
            </p>
            <p className="mt-0.5 text-sm font-medium">{log.resourceName}</p>
            <p className="text-xs text-muted-foreground">{log.resourceType}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Occurred
            </p>
            <p className="mt-0.5 text-sm">
              {formatRelativeTime(log.occurredAt)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Actor Role
            </p>
            <p className="mt-0.5 text-sm">{log.performedBy.role}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Resource ID
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {log.resourceId}
            </p>
          </div>
        </div>

        {log.description && (
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Description
            </p>
            <p className="text-sm text-muted-foreground">{log.description}</p>
          </div>
        )}

        <div>
          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Before / After Changes
          </p>
          <ActivityLogChanges changes={log.changes} />
        </div>

        {(log.ipAddress || log.userAgent) && (
          <div className="rounded-[6px] border border-border/60 bg-muted/20 p-4">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Session Details
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              {log.ipAddress && (
                <p className="inline-flex items-center gap-2">
                  <Globe className="size-3.5" />
                  {log.ipAddress}
                </p>
              )}
              {log.userAgent && (
                <p className="inline-flex items-center gap-2">
                  <Monitor className="size-3.5" />
                  {log.userAgent}
                </p>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
