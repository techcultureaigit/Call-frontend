"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RANGES = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

interface DashboardHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  onRefresh,
  isRefreshing,
}: DashboardHeaderProps) {
  const [range, setRange] = useState<RangeId>("30d");

  return (
    <div className="bg-mesh relative overflow-hidden rounded-2xl border border-border/70 bg-card px-5 py-5 shadow-card sm:px-6 sm:py-6">
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
            <span className="size-1.5 animate-pulse rounded-full bg-brand" />
            Live overview
          </span>
          <h2 className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] brand-text-gradient sm:text-3xl">
            Dashboard
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your platform
            today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-xl border border-border/70 bg-background/70 p-1 backdrop-blur">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold tabular-nums transition-all",
                  range === r.id
                    ? "bg-brand text-brand-foreground shadow-brand"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn(isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
