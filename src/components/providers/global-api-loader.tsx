"use client";

import { AppLoader } from "@/components/ui/app-loader";
import {
  selectIsGlobalLoading,
  useApiLoadingStore,
} from "@/stores/api-loading.store";

/**
 * One fullscreen loader for HTTP work (axios + BFF fetch + withGlobalLoader).
 * Do not also render route `loading.tsx` cards or NavigationLoader — that causes
 * the “loader twice” flash on every page.
 */
export function GlobalApiLoader() {
  const active = useApiLoadingStore(selectIsGlobalLoading);
  const label = useApiLoadingStore((s) => s.label);
  const hint = useApiLoadingStore((s) => s.hint);

  if (!active) return null;

  return <AppLoader variant="global" label={label} hint={hint} />;
}
