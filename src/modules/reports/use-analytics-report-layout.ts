"use client";

import { useCallback, useEffect, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { AnalyticsKpiFilterId } from "@/modules/reports/analytics-kpi-filter";
import {
  DEFAULT_ANALYTICS_REPORT_LAYOUT,
  loadAnalyticsReportLayout,
  saveAnalyticsReportLayout,
  type AnalyticsReportLayout,
  type AnalyticsSectionId,
} from "@/modules/reports/analytics-report-layout";

export function useAnalyticsReportLayout() {
  const [layout, setLayout] = useState<AnalyticsReportLayout>(
    DEFAULT_ANALYTICS_REPORT_LAYOUT
  );
  const [reorderMode, setReorderMode] = useState(false);

  useEffect(() => {
    setLayout(loadAnalyticsReportLayout());
  }, []);

  const persist = useCallback((next: AnalyticsReportLayout) => {
    setLayout(next);
    saveAnalyticsReportLayout(next);
  }, []);

  const reorderSections = useCallback(
    (activeId: AnalyticsSectionId, overId: AnalyticsSectionId) => {
      if (activeId === overId) return;
      const oldIndex = layout.sections.indexOf(activeId);
      const newIndex = layout.sections.indexOf(overId);
      if (oldIndex < 0 || newIndex < 0) return;
      persist({
        ...layout,
        sections: arrayMove(layout.sections, oldIndex, newIndex),
      });
    },
    [layout, persist]
  );

  const reorderKpis = useCallback(
    (activeId: AnalyticsKpiFilterId, overId: AnalyticsKpiFilterId) => {
      if (activeId === overId) return;
      const oldIndex = layout.kpis.indexOf(activeId);
      const newIndex = layout.kpis.indexOf(overId);
      if (oldIndex < 0 || newIndex < 0) return;
      persist({
        ...layout,
        kpis: arrayMove(layout.kpis, oldIndex, newIndex),
      });
    },
    [layout, persist]
  );

  const resetLayout = useCallback(() => {
    persist(DEFAULT_ANALYTICS_REPORT_LAYOUT);
  }, [persist]);

  return {
    layout,
    reorderMode,
    setReorderMode,
    reorderSections,
    reorderKpis,
    resetLayout,
  };
}
