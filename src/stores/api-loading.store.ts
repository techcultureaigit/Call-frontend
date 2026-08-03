import { create } from "zustand";

interface ApiLoadingState {
  pending: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/** Tracks in-flight HTTP calls for the global API loader. */
export const useApiLoadingStore = create<ApiLoadingState>((set) => ({
  pending: 0,
  start: () => set((s) => ({ pending: s.pending + 1 })),
  stop: () => set((s) => ({ pending: Math.max(0, s.pending - 1) })),
  reset: () => set({ pending: 0 }),
}));

/** Paths that poll often — don't flash the global loader for these. */
export function shouldSkipGlobalLoader(path: string): boolean {
  const url = path.toLowerCase();
  if (url.includes("/notifications") && (url.includes("feed=") || url.includes("live="))) {
    return true;
  }
  if (url.includes("/notifications") && url.includes("stats")) {
    return true;
  }
  return false;
}
