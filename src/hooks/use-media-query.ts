"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(query);
  const handler = () => onStoreChange();
  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
}

function getSnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}

/** Always false during SSR + hydration so server/client markup match. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Media query hook that is hydration-safe.
 * First paint matches the server (false); real viewport applies after hydrate.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => getSnapshot(query),
    getServerSnapshot
  );
}

export function useIsMobile(breakpoint = 768): boolean {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}

export function useIsTablet(breakpoint = 1024): boolean {
  return useMediaQuery(
    `(min-width: 768px) and (max-width: ${breakpoint - 1}px)`
  );
}

export function useIsDesktop(breakpoint = 1024): boolean {
  return useMediaQuery(`(min-width: ${breakpoint}px)`);
}
