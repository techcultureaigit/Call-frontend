"use client";

import { Filter, History, LayoutList, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_MODULE_OPTIONS,
} from "@/lib/constants/activity-logs";
import type { AuditAction, AuditModule } from "@/types/activity-log";
import { cn } from "@/lib/utils";

export type ActivityLogsViewMode = "table" | "timeline";

interface ActivityLogsToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  action: AuditAction | "all";
  onActionChange: (v: AuditAction | "all") => void;
  module: AuditModule | "all";
  onModuleChange: (v: AuditModule | "all") => void;
  actorId: string;
  onActorChange: (v: string) => void;
  actors: { id: string; name: string }[];
  viewMode: ActivityLogsViewMode;
  onViewModeChange: (v: ActivityLogsViewMode) => void;
  totalCount?: number;
}

export function ActivityLogsToolbar({
  search,
  onSearchChange,
  action,
  onActionChange,
  module,
  onModuleChange,
  actorId,
  onActorChange,
  actors,
  viewMode,
  onViewModeChange,
  totalCount,
}: ActivityLogsToolbarProps) {
  const hasFilters =
    search.length > 0 ||
    action !== "all" ||
    module !== "all" ||
    actorId !== "all";

  const clearAll = () => {
    onSearchChange("");
    onActionChange("all");
    onModuleChange("all");
    onActorChange("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Activity Logs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete audit trail of system actions with before/after changes.
            {totalCount !== undefined && (
              <span className="ml-1 text-foreground/70">
                · {totalCount} events
              </span>
            )}
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-border/60 bg-muted/30 p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs",
              viewMode === "table" && "bg-background shadow-subtle"
            )}
            onClick={() => onViewModeChange("table")}
          >
            <LayoutList className="size-3.5" />
            Table
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs",
              viewMode === "timeline" && "bg-background shadow-subtle"
            )}
            onClick={() => onViewModeChange("timeline")}
          >
            <History className="size-3.5" />
            Timeline
          </Button>
        </div>
      </div>

      <div className="rounded-[6px] border border-border/60 bg-card p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search logs, actors, resources, changes..."
              className="h-9 pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="size-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </div>

            <Select
              value={action}
              onChange={(e) =>
                onActionChange(e.target.value as AuditAction | "all")
              }
              options={AUDIT_ACTION_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              className="h-9 w-full min-w-[130px] sm:w-auto"
            />

            <Select
              value={module}
              onChange={(e) =>
                onModuleChange(e.target.value as AuditModule | "all")
              }
              options={AUDIT_MODULE_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              className="h-9 w-full min-w-[130px] sm:w-auto"
            />

            <Select
              value={actorId}
              onChange={(e) => onActorChange(e.target.value)}
              options={[
                { label: "All actors", value: "all" },
                ...actors.map((a) => ({ label: a.name, value: a.id })),
              ]}
              className="h-9 w-full min-w-[130px] sm:w-auto"
            />

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-9 gap-1 text-muted-foreground"
              >
                <X className="size-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
