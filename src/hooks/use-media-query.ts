"use client";

import { useEffect, useState } from "react";

type MediaQueryCallback = (event: MediaQueryListEvent) => void;

function subscribe(
  query: string,
  callback: MediaQueryCallback
): () => void {
  const mediaQuery = window.matchMedia(query);
  const handler = (event: MediaQueryListEvent) => callback(event);

  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
}

function getSnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? getSnapshot(query) : false
  );

  useEffect(() => {
    setMatches(getSnapshot(query));
    return subscribe(query, (event) => setMatches(event.matches));
  }, [query]);

  return matches;
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
