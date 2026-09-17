"use client";

import {
  CheckCircle2,
  CircleDashed,
  Clock,
  GripVertical,
  Phone,
  PhoneMissed,
  PhoneOutgoing,
  Split,
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
import { DEFAULT_KPI_ORDER } from "@/modules/reports/analytics-report-layout";
import { KPI_HINT, KPI_TONE, TONE } from "@/modules/reports/analytics-theme";

const KPI_ICONS: Record<string, LucideIcon> = {
  phone: Phone,
  connected: PhoneOutgoing,
  clock: Clock,
  missed: PhoneMissed,
  check: CheckCircle2,
  partial: Split,
  incomplete: CircleDashed,
};

const KPI_ICON_KEY: Record<string, string> = {
  total_calls: "phone",
  connected: "connected",
  avg_duration: "clock",
  missed: "missed",
  survey_complete: "check",
  survey_partial: "partial",
  survey_incomplete: "incomplete",
};

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
  const tone = KPI_TONE[kpi.id] ?? TONE.navy;
  const share = kpi.id === "total_calls" ? 0 : Number(kpi.change) || 0;

  return (
    <div
      className={cn(
        "relative h-[76px] overflow-hidden rounded-[6px] border border-border/70 bg-card px-3 py-2.5",
        "shadow-[0_4px_18px_rgba(44,59,89,0.05)] transition-shadow hover:shadow-elevated",
        isSelected
          ? "border-[#2c3b59]/30 ring-1 ring-[#2c3b59]/12"
          : "border-border/70",
        isDragging && "shadow-elevated"
      )}
    >
      {reorderMode ? (
        <span className="absolute right-1.5 top-1.5 z-10 text-muted-foreground">
          <GripVertical className="size-3.5" />
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (reorderMode) return;
          onSelect?.(kpi.id as AnalyticsKpiFilterId);
        }}
        disabled={reorderMode}
        title={KPI_HINT[kpi.id] || kpi.label}
        className={cn(
          "flex h-full w-full items-center justify-between gap-3 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c3b59]/25",
          reorderMode && "pointer-events-none"
        )}
      >
        <div className="min-w-0">
          <p
            className="truncate text-[10px] font-medium leading-tight text-muted-foreground"
            title={kpi.label}
          >
            {kpi.label}
          </p>
          <p className="mt-1 font-sans text-[18px] font-semibold tabular-nums leading-none tracking-tight text-foreground">
            {kpi.value}
          </p>
          <p className="mt-1 truncate text-[9px] tabular-nums text-muted-foreground">
              {kpi.id === "total_calls" || kpi.id === "avg_duration"
                ? kpi.changeLabel
                : `${share}% of calls`}
            </p>
        </div>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            tone.iconBg
          )}
        >
          <Icon className="size-3.5" strokeWidth={2} />
        </span>
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
        "min-w-0",
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

const KPI_IDS = new Set<string>(DEFAULT_KPI_ORDER);

function orderKpis(
  kpis: ReportKpi[],
  order?: AnalyticsKpiFilterId[]
): ReportKpi[] {
  const visible = kpis.filter((kpi) => KPI_IDS.has(kpi.id));
  if (!order?.length) return visible;
  return order
    .map((id) => visible.find((kpi) => kpi.id === id))
    .filter((kpi): kpi is ReportKpi => Boolean(kpi));
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
  reorderMode?: boolean;
}) {
  const orderedKpis = orderKpis(kpis, order);
  const itemIds = orderedKpis.map((kpi) => kpi.id);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] rounded-[6px]" />
        ))}
      </div>
    );
  }

  return (
    <SortableContext items={itemIds} strategy={rectSortingStrategy}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
