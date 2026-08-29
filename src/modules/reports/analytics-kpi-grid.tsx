"use client";

import {
  CheckCircle2,
  CircleDashed,
  GripVertical,
  Loader2,
  Minus,
  Phone,
  PhoneMissed,
  PhoneOff,
  PhoneOutgoing,
  Split,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReportKpi } from "@/types/reports";
import type { AnalyticsKpiFilterId } from "@/modules/reports/analytics-kpi-filter";

const KPI_ICONS: Record<string, LucideIcon> = {
  phone: Phone,
  connected: PhoneOutgoing,
  disconnected: PhoneOff,
  missed: PhoneMissed,
  check: CheckCircle2,
  partial: Split,
  processing: Loader2,
  incomplete: CircleDashed,
};

const KPI_ICON_KEY: Record<string, string> = {
  total_calls: "phone",
  connected: "connected",
  disconnected: "disconnected",
  missed: "missed",
  survey_complete: "check",
  survey_partial: "partial",
  survey_processing: "processing",
  survey_incomplete: "incomplete",
};

function TrendCaption({ kpi }: { kpi: ReportKpi }) {
  const isMissed = kpi.id === "missed" || kpi.id === "survey_incomplete";
  const positive = isMissed ? kpi.change <= 0 : kpi.trend !== "down";
  const TrendIcon =
    kpi.trend === "up"
      ? TrendingUp
      : kpi.trend === "down"
        ? TrendingDown
        : Minus;

  const showSigned =
    kpi.id === "total_calls" ||
    kpi.id === "avg_duration" ||
    kpi.changeLabel.includes("vs prior");

  return (
    <p
      className={cn(
        "mt-1 flex items-center gap-1 truncate text-[10px] font-medium",
        positive ? "text-[#2c3b59]/80" : "text-[#dc2626]"
      )}
    >
      <TrendIcon className="size-3 shrink-0" />
      {showSigned ? (
        <span className="tabular-nums">
          {kpi.change > 0 ? "+" : ""}
          {kpi.change}%
        </span>
      ) : null}
      <span className="truncate text-muted-foreground">{kpi.changeLabel}</span>
    </p>
  );
}

export function KpiCardBody({
  kpi,
  isSelected,
  reorderMode,
  isDragging,
  onSelect,
}: {
  kpi: ReportKpi;
  isSelected?: boolean;
  reorderMode?: boolean;
  isDragging?: boolean;
  onSelect?: (id: AnalyticsKpiFilterId) => void;
}) {
  const iconKey = kpi.icon ?? KPI_ICON_KEY[kpi.id] ?? "phone";
  const Icon = KPI_ICONS[iconKey] ?? Phone;

  return (
    <div
      className={cn(
        "flex min-h-[88px] w-full min-w-0 items-center gap-2 rounded-[6px] border bg-card px-3 py-4 text-left shadow-subtle sm:gap-3 sm:px-4",
        isSelected
          ? "border-[#2c3b59]/30 ring-1 ring-[#2c3b59]/15"
          : "border-border/60",
        reorderMode && "ring-1 ring-border/50",
        isDragging && "border-[#2c3b59]/40 shadow-elevated ring-2 ring-[#2c3b59]/20"
      )}
    >
      {reorderMode ? (
        <span
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-[6px] text-muted-foreground"
          aria-hidden
        >
          <GripVertical className="size-4" />
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (reorderMode) return;
          onSelect?.(kpi.id as AnalyticsKpiFilterId);
        }}
        disabled={reorderMode}
        title={reorderMode ? "Drag to reorder" : "Click to open details"}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 text-left",
          !reorderMode && "hover:opacity-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c3b59]/25",
          reorderMode && "pointer-events-none"
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-[#2c3b59]/10 text-[#2c3b59]">
          <Icon className="size-[18px]" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-semibold tabular-nums leading-none tracking-tight text-foreground">
            {kpi.value}
          </p>
          <p className="mt-1.5 truncate text-xs text-muted-foreground">
            {kpi.label}
          </p>
          <TrendCaption kpi={kpi} />
        </div>
      </button>
    </div>
  );
}

function SortableKpiCard({
  kpi,
  isSelected,
  reorderMode,
  onSelect,
}: {
  kpi: ReportKpi;
  isSelected: boolean;
  reorderMode: boolean;
  onSelect?: (id: AnalyticsKpiFilterId) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: kpi.id,
    disabled: !reorderMode,
    data: { type: "kpi" },
    animateLayoutChanges: () => false,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-w-0 w-full max-w-full touch-none overflow-hidden",
        reorderMode && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-35"
      )}
      {...(reorderMode ? { ...attributes, ...listeners } : {})}
    >
      <KpiCardBody
        kpi={kpi}
        isSelected={isSelected}
        reorderMode={reorderMode}
        isDragging={isDragging}
        onSelect={onSelect}
      />
    </div>
  );
}

function orderKpis(
  kpis: ReportKpi[],
  order?: AnalyticsKpiFilterId[]
): ReportKpi[] {
  if (!order?.length) return kpis.slice(0, 8);
  return [
    ...order
      .map((id) => kpis.find((kpi) => kpi.id === id))
      .filter((kpi): kpi is ReportKpi => Boolean(kpi)),
    ...kpis.filter(
      (kpi) => !order.includes(kpi.id as AnalyticsKpiFilterId)
    ),
  ].slice(0, 8);
}

export function AnalyticsKpiGrid({
  kpis,
  isLoading,
  selectedId = "total_calls",
  onSelect,
  order,
  reorderMode = false,
}: {
  kpis: ReportKpi[];
  isLoading?: boolean;
  selectedId?: string;
  onSelect?: (id: AnalyticsKpiFilterId) => void;
  order?: AnalyticsKpiFilterId[];
  /** When true, cards are sortable under the parent report DndContext. */
  reorderMode?: boolean;
}) {
  const orderedKpis = orderKpis(kpis, order);
  const itemIds = orderedKpis.map((kpi) => kpi.id);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex min-h-[88px] items-center gap-3 rounded-[6px] border border-border/50 bg-card px-4 py-4"
          >
            <Skeleton className="size-10 shrink-0 rounded-[6px]" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const grid = (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {orderedKpis.map((kpi) => (
        <SortableKpiCard
          key={kpi.id}
          kpi={kpi}
          isSelected={selectedId === kpi.id}
          reorderMode={reorderMode}
          onSelect={onSelect}
        />
      ))}
    </div>
  );

  if (!reorderMode) {
    return grid;
  }

  // SortableContext only — parent AnalyticsReportSections owns DndContext
  return (
    <SortableContext items={itemIds} strategy={rectSortingStrategy}>
      {grid}
    </SortableContext>
  );
}

export function findOrderedKpi(
  kpis: ReportKpi[],
  order: AnalyticsKpiFilterId[] | undefined,
  kpiId: AnalyticsKpiFilterId
) {
  return orderKpis(kpis, order).find((kpi) => kpi.id === kpiId) ?? null;
}
