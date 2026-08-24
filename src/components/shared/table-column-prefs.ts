"use client";

import { apiGet, apiPut, unwrapData } from "@/api/http";
import type { ApiResponse } from "@/types/api";
import type { TableColumnLayoutState } from "./table-column-layout";

type LayoutMap = Record<string, TableColumnLayoutState>;

let cache: LayoutMap | null = null;
let inflight: Promise<LayoutMap> | null = null;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function clearTableColumnPrefsCache() {
  cache = null;
  inflight = null;
  timers.forEach(clearTimeout);
  timers.clear();
}

export async function loadTableColumnPrefs(): Promise<LayoutMap> {
  if (cache) return cache;
  if (!inflight) {
    inflight = unwrapData(
      apiGet<ApiResponse<LayoutMap>>("/api/auth/table-columns")
    )
      .then((data) => {
        cache = data && typeof data === "object" ? data : {};
        return cache;
      })
      .catch(() => {
        cache = {};
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function saveTableColumnPref(key: string, layout: TableColumnLayoutState) {
  cache = { ...(cache ?? {}), [key]: layout };
  const prev = timers.get(key);
  if (prev) clearTimeout(prev);
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key);
      void apiPut("/api/auth/table-columns", { key, ...layout });
    }, 250)
  );
}
