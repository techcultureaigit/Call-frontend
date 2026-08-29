"use client";

import { useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CheckCircle2,
  CircleDashed,
  PhoneMissed,
  PhoneOff,
  PieChart as PieChartIcon,
  type LucideIcon,
} from "lucide-react";
import { useMounted } from "@/hooks";
import { ChartSkeleton } from "@/modules/dashboard/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AnalyticsBadge,
  AnalyticsCard,
} from "@/modules/reports/analytics-card";
import { cn } from "@/lib/utils";
import type { ReportPieSlice } from "@/types/reports";
import type { AnalyticsKpiFilterId } from "@/modules/reports/analytics-kpi-filter";
import { sliceToKpiFilter } from "@/modules/reports/analytics-kpi-filter";

type SliceStyle = {
  fill: string;
  soft: string;
  border: string;
  text: string;
  icon: LucideIcon;
};

const THEME_BLUE = "#3b82f6";
const THEME_YELLOW = "#eab308";
const THEME_RED = "#dc2626";
const THEME_NAVY = "#2c3b59";

const CALL_STYLE: Record<string, SliceStyle> = {
  Connected: {
    fill: THEME_BLUE,
    soft: "bg-[#3b82f6]/8",
    border: "border-[#3b82f6]/20",
    text: "text-[#3b82f6]",
    icon: CheckCircle2,
  },
  Disconnected: {
    fill: THEME_RED,
    soft: "bg-[#dc2626]/8",
    border: "border-[#dc2626]/20",
    text: "text-[#dc2626]",
    icon: PhoneOff,
  },
  Missed: {
    fill: THEME_YELLOW,
    soft: "bg-[#eab308]/10",
    border: "border-[#eab308]/25",
    text: "text-[#ca8a04]",
    icon: PhoneMissed,
  },
};

const SURVEY_STYLE: Record<string, SliceStyle> = {
  Complete: {
    fill: THEME_BLUE,
    soft: "bg-[#3b82f6]/8",
    border: "border-[#3b82f6]/20",
    text: "text-[#3b82f6]",
    icon: CheckCircle2,
  },
  "Partially complete": {
    fill: THEME_YELLOW,
    soft: "bg-[#eab308]/10",
    border: "border-[#eab308]/25",
    text: "text-[#ca8a04]",
    icon: CircleDashed,
  },
  Processing: {
    fill: THEME_NAVY,
    soft: "bg-[#2c3b59]/8",
    border: "border-[#2c3b59]/18",
    text: "text-[#2c3b59]",
    icon: CircleDashed,
  },
  Incomplete: {
    fill: THEME_RED,
    soft: "bg-[#dc2626]/8",
    border: "border-[#dc2626]/20",
    text: "text-[#dc2626]",
    icon: PhoneMissed,
  },
};

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: ReportPieSlice }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const name = payload[0]?.name ?? row?.name ?? "";
  const value = payload[0]?.value ?? row?.value ?? 0;

  return (
    <div className="pointer-events-none z-50 min-w-[120px] rounded-[6px] border border-border/60 bg-popover px-3 py-2 shadow-elevated">
      <p className="text-xs font-semibold leading-tight text-foreground">{name}</p>
      <p className="mt-0.5 text-xs tabular-nums leading-tight text-muted-foreground">
        {row?.count ?? 0} · {value}%
      </p>
      <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
        Click to view clients
      </p>
    </div>
  );
}

export function ReportDashboardDonut({
  data,
  isLoading,
  variant = "call",
  activeFilter,
  onSliceSelect,
}: {
  data: ReportPieSlice[];
  isLoading?: boolean;
  variant?: "call" | "survey";
  activeFilter?: AnalyticsKpiFilterId;
  onSliceSelect?: (filter: AnalyticsKpiFilterId) => void;
}) {
  const mounted = useMounted();
  const [sliceHover, setSliceHover] = useState(false);
  const styleMap = variant === "survey" ? SURVEY_STYLE : CALL_STYLE;
  const total = data.reduce((sum, d) => sum + (d.count ?? 0), 0);
  const styled = data.map((d) => ({
    ...d,
    fill: styleMap[d.name]?.fill ?? d.fill,
  }));

  const centerSlice =
    variant === "call"
      ? data.find((d) => d.name === "Connected")
      : [...data].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))[0];
  const centerPct = centerSlice?.value ?? 0;
  const centerLabel =
    variant === "call" ? "Connected" : (centerSlice?.name ?? "Status");

  const title = variant === "call" ? "Call outcomes" : "Survey status";
  const description =
    variant === "call"
      ? "Click a status to view clients"
      : "Complete · Partial · Processing · Incomplete";

  const handleSelect = (name: string) => {
    const filter = sliceToKpiFilter(variant, name);
    if (filter && onSliceSelect) onSliceSelect(filter);
  };

  if (isLoading) {
    return (
      <AnalyticsCard title={title} description={description} icon={PieChartIcon}>
        <ChartSkeleton height={152} />
      </AnalyticsCard>
    );
  }

  if (!data.length || total === 0) {
    return (
      <AnalyticsCard title={title} description={description} icon={PieChartIcon}>
        <EmptyState icon={PieChartIcon} title="No data" description="Awaiting call activity." />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title={title}
      description={description}
      icon={PieChartIcon}
      className="overflow-visible"
      contentClassName="overflow-visible"
      action={
        <AnalyticsBadge value={total.toLocaleString()} label="Total" />
      }
    >
      <div className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:gap-4">
        <div className="relative h-[160px] w-[160px] shrink-0">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={styled}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="var(--card)"
                  cornerRadius={4}
                  className="cursor-pointer outline-none [&_path]:outline-none"
                  isAnimationActive={false}
                  onMouseEnter={() => setSliceHover(true)}
                  onMouseLeave={() => setSliceHover(false)}
                  onClick={(_, index) => {
                    const name = styled[index]?.name;
                    if (name) handleSelect(name);
                  }}
                >
                  {styled.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.fill}
                      className="cursor-pointer outline-none"
                      stroke="var(--card)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<DonutTooltip />}
                  cursor={false}
                  wrapperStyle={{ outline: "none", zIndex: 50 }}
                  allowEscapeViewBox={{ x: true, y: true }}
                  offset={12}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {!sliceHover ? (
            <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center px-1">
              <p className="font-display text-lg font-semibold tabular-nums leading-none">
                {centerPct}%
              </p>
              <p className="mt-0.5 max-w-[72px] text-center text-[8px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground">
                {centerLabel}
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-1">
          {styled.map((item) => {
            const style = styleMap[item.name];
            const filter = sliceToKpiFilter(variant, item.name);
            const isActive = Boolean(filter && activeFilter === filter);
            const Icon = style?.icon;

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelect(item.name)}
                className={cn(
                  "w-full rounded-[6px] px-1.5 py-1 text-left transition-colors",
                  "hover:bg-muted/40",
                  isActive && "bg-[#2c3b59]/6 ring-1 ring-[#2c3b59]/15"
                )}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    {Icon ? (
                      <Icon className={cn("size-3 shrink-0", style?.text)} />
                    ) : (
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                    )}
                    <span
                      className={cn(
                        "truncate text-[11px] font-medium leading-tight",
                        style?.text
                      )}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold tabular-nums text-foreground">
                    <span className="text-muted-foreground">{item.count ?? 0}</span>
                    {" · "}
                    {item.value}%
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AnalyticsCard>
  );
}
