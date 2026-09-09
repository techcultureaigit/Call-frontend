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
  Clock3,
  Headset,
  PhoneMissed,
  PhoneOff,
  type LucideIcon,
} from "lucide-react";
import { useMounted } from "@/hooks";
import { ChartSkeleton } from "@/modules/dashboard/dashboard-skeleton";
import { AnalyticsCard } from "@/modules/reports/analytics-card";
import { cn } from "@/lib/utils";
import type { ReportPieSlice } from "@/types/reports";
import type { AnalyticsKpiFilterId } from "@/modules/reports/analytics-kpi-filter";
import { sliceToKpiFilter } from "@/modules/reports/analytics-kpi-filter";
import {
  REASON_SLICE_TONE,
  STATUS_HINT,
  STATUS_HINT_SHORT,
  SURVEY_SLICE_TONE,
  TONE,
} from "@/modules/reports/analytics-theme";

type SliceStyle = {
  fill: string;
  text: string;
  icon: LucideIcon;
};

const SURVEY_STYLE: Record<string, SliceStyle> = {
  Complete: {
    fill: TONE.blue.fill,
    text: TONE.blue.text,
    icon: CheckCircle2,
  },
  "Partially complete": {
    fill: TONE.amber.fill,
    text: TONE.amber.text,
    icon: CircleDashed,
  },
  Incomplete: {
    fill: TONE.slate.fill,
    text: TONE.slate.text,
    icon: CircleDashed,
  },
  Missed: {
    fill: TONE.red.fill,
    text: TONE.red.text,
    icon: PhoneMissed,
  },
};

const REASON_STYLE: Record<string, SliceStyle> = {
  "Disconnected by caller": {
    fill: TONE.red.fill,
    text: TONE.red.text,
    icon: PhoneOff,
  },
  "Disconnected by agent": {
    fill: TONE.blue.fill,
    text: TONE.blue.text,
    icon: Headset,
  },
  Unknown: {
    fill: TONE.slate.fill,
    text: TONE.slate.text,
    icon: CircleDashed,
  },
};

const CENTER_LABEL: Record<string, string> = {
  Complete: "Complete",
  "Partially complete": "Partial complete",
  Incomplete: "Incomplete",
  Missed: "Missed",
  "Disconnected by caller": "Caller",
  "Disconnected by agent": "Agent",
  Unknown: "Unknown",
};

/** Left of chart / right of chart for survey status. */
const SURVEY_LEFT_ORDER = ["Complete", "Incomplete"];
const SURVEY_RIGHT_ORDER = ["Partially complete", "Missed"];

const EMPHASIS = new Set([
  "Complete",
  "Partially complete",
  "Disconnected by caller",
  "Disconnected by agent",
]);

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
      {STATUS_HINT[name] ? (
        <p className="mt-1 max-w-[200px] text-[10px] leading-snug text-muted-foreground">
          {STATUS_HINT[name]}
        </p>
      ) : null}
    </div>
  );
}

function StatusTile({
  item,
  isActive,
  isTop,
  onSelect,
}: {
  item: ReportPieSlice & { fill: string };
  isActive: boolean;
  isTop: boolean;
  onSelect: () => void;
}) {
  const hint = STATUS_HINT_SHORT[item.name] ?? STATUS_HINT[item.name];
  const emphasis = EMPHASIS.has(item.name);

  return (
    <button
      type="button"
      title={STATUS_HINT[item.name]}
      onClick={onSelect}
      className={cn(
        "w-full rounded-[6px] border px-2.5 py-1.5 text-left transition-all",
        "hover:shadow-subtle",
        emphasis ? "border-transparent" : "border-transparent hover:bg-muted/40",
        item.name === "Complete" && "ring-1 ring-[#60a5fa]/25",
        item.name === "Partially complete" && "ring-1 ring-[#fbbf24]/30",
        isActive && "ring-1 ring-[#2c3b59]/25"
      )}
      style={
        emphasis
          ? {
              background: `linear-gradient(135deg, ${item.fill}12 0%, transparent 70%)`,
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="truncate text-[12px] font-semibold text-foreground">
              {item.name}
            </span>
            {isTop ? (
              <span className="rounded-full bg-amber-400/20 px-1.5 py-px text-[9px] font-semibold text-amber-700">
                Highest
              </span>
            ) : null}
          </div>
          {hint ? (
            <p className="mt-0.5 pl-3.5 text-[10px] leading-snug text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-right tabular-nums">
          <span className="block text-[14px] font-semibold leading-none text-foreground">
            {item.count ?? 0}
          </span>
          <span className="mt-0.5 block text-[10px] font-medium text-muted-foreground">
            {item.value}%
          </span>
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted/60">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${item.value}%`,
            backgroundColor: item.fill,
          }}
        />
      </div>
    </button>
  );
}

export function ReportDashboardDonut({
  data,
  isLoading,
  variant = "survey",
  activeFilter,
  onSliceSelect,
}: {
  data: ReportPieSlice[];
  isLoading?: boolean;
  variant?: "survey" | "reason";
  activeFilter?: AnalyticsKpiFilterId;
  onSliceSelect?: (filter: AnalyticsKpiFilterId) => void;
}) {
  const mounted = useMounted();
  const [sliceHover, setSliceHover] = useState(false);
  const styleMap = variant === "reason" ? REASON_STYLE : SURVEY_STYLE;
  const total = data.reduce((sum, d) => sum + (d.count ?? 0), 0);
  const styled = data.map((d) => ({
    ...d,
    fill:
      styleMap[d.name]?.fill ??
      SURVEY_SLICE_TONE[d.name]?.fill ??
      REASON_SLICE_TONE[d.name]?.fill ??
      d.fill,
  }));

  const byName = Object.fromEntries(styled.map((d) => [d.name, d]));

  const centerSlice = [...data].sort(
    (a, b) => (b.count ?? 0) - (a.count ?? 0)
  )[0];
  const centerPct = centerSlice?.value ?? 0;
  const centerLabel =
    CENTER_LABEL[centerSlice?.name ?? ""] ?? centerSlice?.name ?? "Status";
  const centerFill =
    styleMap[centerSlice?.name ?? ""]?.fill ??
    REASON_SLICE_TONE[centerSlice?.name ?? ""]?.fill ??
    TONE.navy.fill;

  const title =
    variant === "reason" ? "Disconnect reason" : "Survey status";
  const description =
    variant === "reason"
      ? "Who ended the connected call — caller or agent"
      : "Missed = not picked up · Incomplete = picked up, no answers";
  const HeaderIcon = variant === "survey" ? Clock3 : PhoneOff;
  const emptyCopy =
    variant === "reason"
      ? "No disconnect reasons on connected calls."
      : "No call activity in this period.";
  const totalLabel = (
    <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
      {total.toLocaleString()} {variant === "reason" ? "Connected" : "Total"}
    </span>
  );

  const handleSelect = (name: string) => {
    const filter = sliceToKpiFilter(variant, name);
    if (filter && onSliceSelect) onSliceSelect(filter);
  };

  if (isLoading) {
    return (
      <AnalyticsCard
        title={title}
        description={description}
        icon={HeaderIcon}
        compact
      >
        <ChartSkeleton height={140} />
      </AnalyticsCard>
    );
  }

  if (!data.length || total === 0) {
    return (
      <AnalyticsCard
        title={title}
        description={description}
        icon={HeaderIcon}
        compact
      >
        <p className="py-4 text-center text-sm text-muted-foreground">
          {emptyCopy}
        </p>
      </AnalyticsCard>
    );
  }

  const leftItems =
    variant === "survey"
      ? SURVEY_LEFT_ORDER.map((n) => byName[n]).filter(Boolean)
      : styled;
  const rightItems =
    variant === "survey"
      ? SURVEY_RIGHT_ORDER.map((n) => byName[n]).filter(Boolean)
      : [];

  return (
    <AnalyticsCard
      title={title}
      description={description}
      icon={HeaderIcon}
      action={totalLabel}
      compact
      className="overflow-hidden shadow-[0_4px_18px_rgba(44,59,89,0.05)]"
      contentClassName="pt-2"
    >
      {variant === "survey" ? (
        <div className="grid items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex min-w-0 flex-col gap-1.5">
            {leftItems.map((item) => {
              const filter = sliceToKpiFilter(variant, item.name);
              return (
                <StatusTile
                  key={item.name}
                  item={item}
                  isActive={Boolean(filter && activeFilter === filter)}
                  isTop={item.name === centerSlice?.name}
                  onSelect={() => handleSelect(item.name)}
                />
              );
            })}
          </div>

          <div className="relative mx-auto size-[132px] shrink-0">
            <div
              className="pointer-events-none absolute inset-[-6px] rounded-full opacity-40 blur-[10px]"
              style={{
                background: `radial-gradient(circle, ${centerFill}55 0%, transparent 70%)`,
              }}
            />
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={styled}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={58}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={3}
                    stroke="var(--card)"
                    cornerRadius={5}
                    className="cursor-pointer outline-none [&_path]:outline-none"
                    isAnimationActive
                    animationBegin={80}
                    animationDuration={900}
                    animationEasing="ease-out"
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
                        className="cursor-pointer outline-none transition-opacity"
                        stroke="var(--card)"
                        strokeWidth={3}
                        style={{
                          filter: EMPHASIS.has(entry.name)
                            ? "drop-shadow(0 1px 3px rgba(44,59,89,0.08))"
                            : undefined,
                          opacity: 1,
                        }}
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
              <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center px-3">
                <p
                  className="font-sans text-[20px] font-semibold tabular-nums leading-none tracking-tight"
                  style={{ color: centerFill }}
                >
                  {centerPct}%
                </p>
                <p className="mt-1 max-w-[80px] text-center text-[8px] font-semibold uppercase leading-tight tracking-[0.12em] text-muted-foreground">
                  {centerLabel}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            {rightItems.map((item) => {
              const filter = sliceToKpiFilter(variant, item.name);
              return (
                <StatusTile
                  key={item.name}
                  item={item}
                  isActive={Boolean(filter && activeFilter === filter)}
                  isTop={item.name === centerSlice?.name}
                  onSelect={() => handleSelect(item.name)}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative mx-auto size-[128px] shrink-0">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={styled}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={56}
                    paddingAngle={2.5}
                    dataKey="value"
                    strokeWidth={3}
                    stroke="var(--card)"
                    cornerRadius={4}
                    isAnimationActive
                    animationDuration={800}
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
                        stroke="var(--card)"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {!sliceHover ? (
              <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center">
                <p className="text-lg font-semibold tabular-nums">{centerPct}%</p>
                <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {centerLabel}
                </p>
              </div>
            ) : null}
          </div>
          <div
            className={cn(
              "grid min-w-0 flex-1 gap-1.5",
              variant === "reason" ? "grid-cols-1" : "grid-cols-2"
            )}
          >
            {styled.map((item) => {
              const filter = sliceToKpiFilter(variant, item.name);
              return (
                <StatusTile
                  key={item.name}
                  item={item}
                  isActive={Boolean(filter && activeFilter === filter)}
                  isTop={item.name === centerSlice?.name}
                  onSelect={() => handleSelect(item.name)}
                />
              );
            })}
          </div>
        </div>
      )}
    </AnalyticsCard>
  );
}
