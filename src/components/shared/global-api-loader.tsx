"use client";

import { useEffect } from "react";
import { AppLoader } from "@/components/shared/app-loader";
import {
  selectIsGlobalLoading,
  useApiLoadingStore,
} from "@/components/shared/api-loading.store";

/** Auto-clear stuck overlay (e.g. aborted request without matching stop). */
const GLOBAL_LOADER_MAX_MS = 12_000;

/** One fullscreen loader for mutations — list GETs use local AppLoader instead. */
export function GlobalApiLoader() {
  const active = useApiLoadingStore(selectIsGlobalLoading);
  const label = useApiLoadingStore((s) => s.label);
  const hint = useApiLoadingStore((s) => s.hint);

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => {
      useApiLoadingStore.getState().reset();
    }, GLOBAL_LOADER_MAX_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (!active) return null;

  return <AppLoader variant="global" label={label} hint={hint} />;
}
