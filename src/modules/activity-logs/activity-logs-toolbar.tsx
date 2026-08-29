"use client";

import { History, LayoutList, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_MODULE_OPTIONS,
} from "@/modules/activity-logs/activity-logs-constants";
import type { AuditAction, AuditModule } from "@/types/activity-log";
import { PAGE_TITLE_CLASS } from "@/components/shared/page-heading";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { TOOLBAR_SEARCH_WIDTH_CLASS } from "@/components/shared/toolbar-styles";
import { cn } from "@/lib/utils";

export type ActivityLogsViewMode = "table" | "timeline";

const FILTER_SELECT_CLASS =
  "h-9 w-full min-w-[130px] rounded-[6px] border-border/50 bg-background/80 shadow-subtle sm:w-auto lg:h-11";

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
          <h2 className={PAGE_TITLE_CLASS}>Activity Logs</h2>
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

      <ListToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search logs, actors, resources, changes..."
        searchAriaLabel="Search activity logs"
        searchClassName={TOOLBAR_SEARCH_WIDTH_CLASS}
        alignControlsEnd
        filters={
          <>
            <Select
              value={action}
              onChange={(e) =>
                onActionChange(e.target.value as AuditAction | "all")
              }
              options={AUDIT_ACTION_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              className={FILTER_SELECT_CLASS}
              aria-label="Filter by action"
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
              className={FILTER_SELECT_CLASS}
              aria-label="Filter by module"
            />
            <Select
              value={actorId}
              onChange={(e) => onActorChange(e.target.value)}
              options={[
                { label: "All actors", value: "all" },
                ...actors.map((a) => ({ label: a.name, value: a.id })),
              ]}
              className={FILTER_SELECT_CLASS}
              aria-label="Filter by actor"
            />
          </>
        }
        actions={
          hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-9 gap-1 text-muted-foreground lg:h-11"
            >
              <X className="size-3.5" />
              Clear
            </Button>
          ) : null
        }
      />
    </div>
  );
}
