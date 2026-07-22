"use client";

import { Phone, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CALL_STATUS_OPTIONS } from "@/lib/constants/calls";
import type { CallStatus } from "@/types/call";

export type CallsViewMode = "history" | "live" | "recordings";

interface CallsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: CallStatus | "all";
  onStatusChange: (value: CallStatus | "all") => void;
  viewMode: CallsViewMode;
  totalCount?: number;
}

const viewTitles: Record<CallsViewMode, { title: string; description: string }> = {
  history: {
    title: "Call History",
    description: "Browse and review all outbound and inbound calls.",
  },
  live: {
    title: "Live Calls",
    description: "Monitor active and queued calls in real time.",
  },
  recordings: {
    title: "Recordings",
    description: "Calls with available recordings and transcripts.",
  },
};

export function CallsToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  viewMode,
  totalCount,
}: CallsToolbarProps) {
  const { title, description } = viewTitles[viewMode];
  const hasFilters = status !== "all" || search.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Phone className="size-5 text-primary" />
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
          {totalCount !== undefined && (
            <span className="ml-1 font-medium text-foreground">
              ({totalCount} total)
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-[6px] border border-border/60 bg-card p-4 shadow-card lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer, company, agent, or campaign..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 border-border/60 bg-muted/30 pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {viewMode !== "live" && (
            <>
              <SlidersHorizontal className="hidden size-4 text-muted-foreground sm:block" />
              <Select
                value={status}
                onChange={(e) =>
                  onStatusChange(e.target.value as CallStatus | "all")
                }
                options={[
                  { label: "All Statuses", value: "all" },
                  ...CALL_STATUS_OPTIONS,
                ]}
                className="w-full sm:w-[160px]"
              />
            </>
          )}

          {hasFilters && viewMode !== "live" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSearchChange("");
                onStatusChange("all");
              }}
              className="h-9 text-muted-foreground"
            >
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
