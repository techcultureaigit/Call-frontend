"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ANALYTICS_SECTION_IDS,
  ANALYTICS_SECTION_LABELS,
  ANALYTICS_SECTION_SPAN,
  DEFAULT_KPI_ORDER,
  type AnalyticsSectionId,
} from "@/modules/reports/analytics-report-layout";
import type { AnalyticsKpiFilterId } from "@/modules/reports/analytics-kpi-filter";

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
};

type DragType = "section" | "kpi";

function isSectionId(id: string): id is AnalyticsSectionId {
  return (ANALYTICS_SECTION_IDS as readonly string[]).includes(id);
}

function isKpiId(id: string): id is AnalyticsKpiFilterId {
  return (DEFAULT_KPI_ORDER as readonly string[]).includes(
    id as AnalyticsKpiFilterId
  );
}

/** Only collide with same-type items (section↔section, kpi↔kpi). */
const typedCollision: CollisionDetection = (args) => {
  const activeType = args.active.data.current?.type as DragType | undefined;
  const collisions = closestCorners(args);
  if (!activeType) return collisions;

  return collisions.filter((collision) => {
    const container = args.droppableContainers.find(
      (item) => item.id === collision.id
    );
    return container?.data.current?.type === activeType;
  });
};

function SortableSectionShell({
  id,
  reorderMode,
  children,
}: {
  id: AnalyticsSectionId;
  reorderMode: boolean;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id,
    disabled: !reorderMode,
    data: { type: "section" satisfies DragType },
    animateLayoutChanges: () => false,
  });

  const span = ANALYTICS_SECTION_SPAN[id];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative isolate flex min-w-0 w-full max-w-full flex-col gap-1.5 overflow-hidden",
        isDragging && "opacity-35"
      )}
      style={{
        gridColumn: span === 2 ? "1 / -1" : "span 1",
      }}
    >
      {reorderMode ? (
        <div className="flex shrink-0 items-center gap-2 rounded-[6px] border border-dashed border-border/60 bg-muted/30 px-2 py-1.5">
          <button
            type="button"
            className="inline-flex size-7 cursor-grab touch-none items-center justify-center rounded-[5px] text-muted-foreground transition-colors hover:bg-background hover:text-foreground active:cursor-grabbing"
            aria-label={`Move ${ANALYTICS_SECTION_LABELS[id]}`}
            title="Drag to move this block"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
          <span className="truncate text-[11px] font-medium text-muted-foreground">
            {ANALYTICS_SECTION_LABELS[id]}
          </span>
          <span className="ml-auto hidden shrink-0 text-[10px] text-muted-foreground/70 sm:inline">
            Move block
          </span>
        </div>
      ) : null}
      <div
        className={cn(
          "min-h-0 min-w-0 w-full flex-1 overflow-hidden",
          isDragging && "pointer-events-none"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function AnalyticsReportSections({
  sectionOrder,
  reorderMode,
  onReorderSections,
  onReorderKpis,
  renderSection,
  renderKpiOverlay,
}: {
  sectionOrder: AnalyticsSectionId[];
  reorderMode: boolean;
  onReorderSections: (
    activeId: AnalyticsSectionId,
    overId: AnalyticsSectionId
  ) => void;
  onReorderKpis: (
    activeId: AnalyticsKpiFilterId,
    overId: AnalyticsKpiFilterId
  ) => void;
  renderSection: (id: AnalyticsSectionId) => ReactNode;
  renderKpiOverlay?: (kpiId: AnalyticsKpiFilterId) => ReactNode;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<DragType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setActiveType((event.active.data.current?.type as DragType) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const type = active.data.current?.type as DragType | undefined;
    setActiveId(null);
    setActiveType(null);

    if (!over || active.id === over.id) return;

    const activeStr = String(active.id);
    const overStr = String(over.id);

    if (type === "section" && isSectionId(activeStr) && isSectionId(overStr)) {
      onReorderSections(activeStr, overStr);
      return;
    }

    if (type === "kpi" && isKpiId(activeStr) && isKpiId(overStr)) {
      onReorderKpis(activeStr, overStr);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveType(null);
  };

  const overlayLabel = useMemo(() => {
    if (!activeId) return null;
    if (activeType === "section" && isSectionId(activeId)) {
      return ANALYTICS_SECTION_LABELS[activeId];
    }
    return null;
  }, [activeId, activeType]);

  const gridClassName =
    "grid grid-cols-1 items-stretch gap-4 overflow-hidden lg:grid-cols-2 lg:gap-5";

  if (!reorderMode) {
    return (
      <div className={gridClassName}>
        {sectionOrder.map((id) => {
          const span = ANALYTICS_SECTION_SPAN[id];
          return (
            <div
              key={id}
              className="min-w-0 w-full max-w-full overflow-hidden"
              style={{ gridColumn: span === 2 ? "1 / -1" : "span 1" }}
            >
              {renderSection(id)}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <DndContext
      id="analytics-report-dnd"
      sensors={sensors}
      collisionDetection={typedCollision}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sectionOrder} strategy={rectSortingStrategy}>
        <div className={gridClassName}>
          {sectionOrder.map((id) => (
            <SortableSectionShell key={id} id={id} reorderMode={reorderMode}>
              {renderSection(id)}
            </SortableSectionShell>
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeType === "section" && overlayLabel ? (
          <div className="w-[min(320px,70vw)] rounded-[8px] border border-brand/30 bg-card px-4 py-3 shadow-elevated">
            <div className="flex items-center gap-2">
              <GripVertical className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm font-medium">{overlayLabel}</span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Drop to place · left / right / up / down
            </p>
          </div>
        ) : null}
        {activeType === "kpi" &&
        activeId &&
        isKpiId(activeId) &&
        renderKpiOverlay
          ? renderKpiOverlay(activeId)
          : null}
      </DragOverlay>
    </DndContext>
  );
}
