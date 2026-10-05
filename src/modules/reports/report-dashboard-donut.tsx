"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
import { AppLoader } from "@/components/shared/app-loader";
import { AnalyticsCard } from "@/modules/reports/analytics-card";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ReportPieSlice } from "@/types/reports";
import type { AnalyticsKpiFilterId } from "@/modules/reports/analytics-kpi-filter";
import { sliceToKpiFilter } from "@/modules/reports/analytics-kpi-filter";
import {
  REASON_EXTRA_FILLS,
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
    fill: TONE.blue.fill,
    text: TONE.blue.text,
    icon: PhoneOff,
  },
  "Disconnected by agent": {
    fill: TONE.navy.fill,
    text: TONE.navy.text,
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

/** Display order for compact 2×2 survey tiles (narrow cards / tablet). */
const SURVEY_TILE_ORDER = [
  "Complete",
  "Partially complete",
  "Incomplete",
  "Missed",
];

/** Left of chart / right of chart for survey status (wide cards). */
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
    <div className="pointer-events-none z-[80] w-max max-w-[240px] whitespace-normal rounded-[6px] border border-border/60 bg-popover px-3 py-2 shadow-elevated">
      <p className="text-xs font-semibold leading-tight text-foreground">{name}</p>
      <p className="mt-0.5 text-xs tabular-nums leading-tight text-muted-foreground">
        {row?.count ?? 0} · {value}%
      </p>
      {STATUS_HINT[name] ? (
        <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
          {STATUS_HINT[name]}
        </p>
      ) : row?.detail ? (
        <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
          {row.detail}
        </p>
      ) : null}
    </div>
  );
}

const CHART_FONT = {
  fontSize: 11,
  fontFamily: "inherit",
  fill: "#64748b",
} as const;

function causeAxisLines(name: string): [string, string] {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const piece = word.length > 12 ? `${word.slice(0, 10)}…` : word;
    const next = current ? `${current} ${piece}` : piece;
    if (next.length > 12 && current) {
      lines.push(current);
      current = piece;
      if (lines.length === 2) break;
    } else {
      current = next;
    }
  }
  if (lines.length < 2 && current) lines.push(current);
  const shown = lines.join(" ");
  if (words.join(" ").length > shown.length && lines[0]) {
    const last = lines.length === 1 ? 0 : 1;
    const base = (lines[last] ?? "").replace(/…$/, "");
    lines[last] = `${base.slice(0, 10)}…`;
  }
  return [lines[0] ?? "", lines[1] ?? ""];
}

function HangupAxisTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
}) {
  const [first, second] = String(payload?.value ?? "").split("\n");
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#64748b" fontSize={10} fontFamily="inherit">
        <tspan x={0} dy={12}>
          {first}
        </tspan>
        {second ? (
          <tspan x={0} dy={12}>
            {second}
          </tspan>
        ) : null}
      </text>
    </g>
  );
}

function HangupMixedTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ReportPieSlice & { label?: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="pointer-events-none z-[80] w-max max-w-[260px] whitespace-normal rounded-[6px] border border-border/60 bg-popover px-3 py-2 font-sans shadow-elevated">
      <p className="text-xs font-semibold leading-snug text-foreground">{row.name}</p>
      <p className="mt-0.5 text-xs tabular-nums leading-tight text-muted-foreground">
        {row.count ?? 0} calls · {row.value}%
      </p>
      {row.detail ? (
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{row.detail}</p>
      ) : null}
    </div>
  );
}

function HangupMixedChart({
  rows,
}: {
  rows: Array<ReportPieSlice & { label: string }>;
}) {
  const mounted = useMounted();
  if (!mounted) return <div className="h-full w-full" />;
  return (
    <div className="h-full w-full min-w-0 font-sans text-[11px] text-muted-foreground [&_.recharts-legend-item-text]:!text-foreground [&_.recharts-legend-item-text]:![font-family:inherit] [&_.recharts-cartesian-axis-tick_text]:![font-family:inherit]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={rows}
          margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
          style={{ fontFamily: "inherit" }}
        >
          <CartesianGrid vertical={false} stroke="#e7edf6" />
          <XAxis
            dataKey="label"
            interval={0}
            tick={<HangupAxisTick />}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            height={36}
          />
          <YAxis
            yAxisId="calls"
            tick={CHART_FONT}
            tickLine={false}
            axisLine={false}
            width={36}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="share"
            orientation="right"
            tick={CHART_FONT}
            tickLine={false}
            axisLine={false}
            width={36}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            content={<HangupMixedTooltip />}
            cursor={{ fill: "rgba(44,59,89,0.04)" }}
            wrapperStyle={{ outline: "none", zIndex: 80, pointerEvents: "none" }}
          />
          <Legend
            verticalAlign="top"
            align="center"
            wrapperStyle={{ fontFamily: "inherit", fontSize: 11, paddingBottom: 8 }}
          />
          <Bar
            yAxisId="calls"
            dataKey="count"
            name="Calls"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          >
            {rows.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
          <Line
            yAxisId="share"
            type="monotone"
            dataKey="value"
            name="Share %"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={{ r: 3, fill: "#60a5fa", strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusTile({
  item,
  isActive,
  isTop,
  onSelect,
  compact = false,
}: {
  item: ReportPieSlice & { fill: string };
  isActive: boolean;
  isTop: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  const hint = STATUS_HINT_SHORT[item.name] ?? STATUS_HINT[item.name];
  const fullHint = STATUS_HINT[item.name];
  const emphasis = EMPHASIS.has(item.name);

  return (
    <UiTooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "w-full min-w-0 rounded-[6px] border text-left transition-all",
            compact ? "px-1.5 py-1" : "px-2 py-1.5",
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
          <div className="flex min-w-0 items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="min-w-0 truncate text-[10px] font-semibold leading-snug text-foreground sm:text-[11px]">
                  {compact && item.name === "Partially complete"
                    ? "Partial"
                    : item.name}
                </span>
                {isTop ? (
                  <span className="hidden shrink-0 rounded-full bg-amber-400/20 px-1 py-px text-[7px] font-semibold text-amber-700 @[420px]/donut:inline">
                    Highest
                  </span>
                ) : null}
              </div>
              {hint && !compact ? (
                <p className="mt-0.5 line-clamp-2 pl-3.5 text-[8px] leading-snug text-muted-foreground sm:text-[9px]">
                  {hint}
                </p>
              ) : null}
            </div>
            <span className="shrink-0 text-right tabular-nums">
              <span className="block text-[11px] font-semibold leading-none text-foreground sm:text-[12px]">
                {item.count ?? 0}
              </span>
              <span className="mt-0.5 block text-[8px] font-medium text-muted-foreground sm:text-[9px]">
                {item.value}%
              </span>
            </span>
          </div>
          <div
            className={cn(
              "h-1 overflow-hidden rounded-full bg-muted/60",
              compact ? "mt-1" : "mt-1.5"
            )}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${item.value}%`,
                backgroundColor: item.fill,
              }}
            />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        collisionPadding={12}
        className="z-[90] max-w-[240px] space-y-1 px-3 py-2"
      >
        <p className="text-xs font-semibold text-popover-foreground">{item.name}</p>
        <p className="text-[11px] tabular-nums text-muted-foreground">
          {item.count ?? 0} · {item.value}%
        </p>
        {fullHint ? (
          <p className="text-[11px] leading-snug text-muted-foreground">
            {fullHint}
          </p>
        ) : null}
      </TooltipContent>
    </UiTooltip>
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
  const styleMap = variant === "reason" ? REASON_STYLE : SURVEY_STYLE;
  const total = data.reduce((sum, d) => sum + (d.count ?? 0), 0);
  let extraReasonIndex = 0;
  const styled = data.map((d) => {
    const mapped = styleMap[d.name]?.fill
      ?? SURVEY_SLICE_TONE[d.name]?.fill
      ?? REASON_SLICE_TONE[d.name]?.fill;
    let fill = mapped;
    if (!fill && variant === "reason") {
      fill = REASON_EXTRA_FILLS[extraReasonIndex % REASON_EXTRA_FILLS.length];
      extraReasonIndex += 1;
    }
    return { ...d, fill: fill ?? TONE.navy.fill };
  });

  const byName = Object.fromEntries(styled.map((d) => [d.name, d]));

  const centerSlice = [...data].sort(
    (a, b) => (b.count ?? 0) - (a.count ?? 0)
  )[0];
  const centerPct = centerSlice?.value ?? 0;
  const centerLabel =
    CENTER_LABEL[centerSlice?.name ?? ""] ?? centerSlice?.name ?? "Status";
  const centerFill =
    styled.find((slice) => slice.name === centerSlice?.name)?.fill ??
    TONE.navy.fill;

  const title =
    variant === "reason" ? "Hangup cause" : "Survey status";
  const description =
    variant === "reason"
      ? "Hangup cause description for every call"
      : "Complete = all answers · Partial = some · Incomplete = picked up, none · Missed = not picked up";
  const HeaderIcon = variant === "survey" ? Clock3 : PhoneOff;
  const emptyCopy =
    variant === "reason"
      ? "No hangup cause recorded."
      : "No call activity in this period.";
  const totalLabel = (
    <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
      {total.toLocaleString()} {variant === "reason" ? "Calls" : "Total"}
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
        className="h-full w-full shadow-[0_4px_18px_rgba(44,59,89,0.05)]"
      >
        <AppLoader
          variant="compact"
          label="Loading analytics"
          hint="Fetching latest data"
        />
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
        className="h-full w-full shadow-[0_4px_18px_rgba(44,59,89,0.05)]"
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
  const surveyTiles =
    variant === "survey"
      ? SURVEY_TILE_ORDER.map((n) => byName[n]).filter(Boolean)
      : [];

  const renderTile = (
    item: ReportPieSlice & { fill: string },
    compact?: boolean
  ) => {
    const filter = sliceToKpiFilter(variant, item.name);
    return (
      <StatusTile
        key={item.name}
        item={item}
        isActive={Boolean(filter && activeFilter === filter)}
        isTop={item.name === centerSlice?.name}
        onSelect={() => handleSelect(item.name)}
        compact={compact}
      />
    );
  };

  return (
    <TooltipProvider delayDuration={150}>
      <AnalyticsCard
        title={title}
        description={description}
        icon={HeaderIcon}
        action={totalLabel}
        compact
        className="h-full w-full shadow-[0_4px_18px_rgba(44,59,89,0.05)]"
      >
        <div
          className={cn(
            "@container/donut flex w-full min-w-0 flex-col justify-center overflow-y-auto",
            variant === "reason" ? "h-[400px]" : "h-[232px]"
          )}
        >
          {variant === "survey" ? (
            <>
              {/* Wide card: left | donut | right */}
              <div className="hidden w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 @[520px]/donut:grid">
                <div className="flex min-w-0 flex-col gap-1 overflow-visible">
                  {leftItems.map((item) => renderTile(item))}
                </div>

                <div className="relative mx-auto flex size-[124px] shrink-0 items-center justify-center overflow-visible">
                  <div className="relative size-[112px] overflow-visible">
                    <div
                      className="pointer-events-none absolute inset-[-4px] rounded-full opacity-40 blur-[10px]"
                      style={{
                        background: `radial-gradient(circle, ${centerFill}55 0%, transparent 70%)`,
                      }}
                    />
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                          <Pie
                            data={styled}
                            cx="50%"
                            cy="50%"
                            innerRadius={34}
                            outerRadius={48}
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
                            wrapperStyle={{
                              outline: "none",
                              zIndex: 80,
                              overflow: "visible",
                              pointerEvents: "none",
                            }}
                            allowEscapeViewBox={{ x: true, y: true }}
                            offset={16}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center px-3">
                      <p
                        className="font-sans text-[16px] font-semibold tabular-nums leading-none tracking-tight"
                        style={{ color: centerFill }}
                      >
                        {centerPct}%
                      </p>
                      <p className="mt-1 line-clamp-3 max-w-[80px] text-center text-[8px] font-semibold uppercase leading-tight tracking-[0.12em] text-muted-foreground">
                        {centerLabel}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col gap-1 overflow-visible">
                  {rightItems.map((item) => renderTile(item))}
                </div>
              </div>

              {/* Narrow card (768 / 1024 half-width): donut + 2×2 tiles */}
              <div className="flex w-full flex-col items-center gap-2 overflow-visible @[520px]/donut:hidden">
                <div className="relative flex size-[112px] shrink-0 items-center justify-center overflow-visible">
                  <div className="relative size-[100px] overflow-visible">
                    <div
                      className="pointer-events-none absolute inset-[-4px] rounded-full opacity-35 blur-[8px]"
                      style={{
                        background: `radial-gradient(circle, ${centerFill}55 0%, transparent 70%)`,
                      }}
                    />
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                          <Pie
                            data={styled}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={42}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={3}
                            stroke="var(--card)"
                            cornerRadius={5}
                            isAnimationActive
                            animationDuration={800}
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
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center px-2">
                      <p
                        className="font-sans text-[15px] font-semibold tabular-nums leading-none"
                        style={{ color: centerFill }}
                      >
                        {centerPct}%
                      </p>
                      <p className="mt-0.5 text-center text-[7px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {centerLabel}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid w-full grid-cols-2 gap-1 overflow-visible">
                  {surveyTiles.map((item) => renderTile(item, true))}
                </div>
              </div>
            </>
          ) : (
            <HangupMixedChart
              rows={styled
                .slice()
                .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
                .map((item) => ({
                  ...item,
                  label: causeAxisLines(item.name).filter(Boolean).join("\n"),
                  count: item.count ?? 0,
                }))}
            />
          )}
        </div>
      </AnalyticsCard>
    </TooltipProvider>
  );
}
