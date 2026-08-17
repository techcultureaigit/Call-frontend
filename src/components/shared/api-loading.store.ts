import { create } from "zustand";

export interface LoaderMessage {
  label?: string;
  hint?: string;
}

interface ApiLoadingState {
  pending: number;
  label: string;
  hint: string;
  start: (msg?: LoaderMessage) => void;
  stop: () => void;
  reset: () => void;
}

const DEFAULT_LABEL = "Loading";
const DEFAULT_HINT = "Please wait a moment";

/** Tracks in-flight HTTP for the single global AppLoader. */
export const useApiLoadingStore = create<ApiLoadingState>((set) => ({
  pending: 0,
  label: DEFAULT_LABEL,
  hint: DEFAULT_HINT,

  start: (msg) =>
    set((s) => ({
      pending: s.pending + 1,
      label: msg?.label ?? s.label ?? DEFAULT_LABEL,
      hint: msg?.hint ?? s.hint ?? DEFAULT_HINT,
    })),

  stop: () =>
    set((s) => {
      const pending = Math.max(0, s.pending - 1);
      if (pending === 0) {
        return {
          pending: 0,
          label: DEFAULT_LABEL,
          hint: DEFAULT_HINT,
        };
      }
      return { pending };
    }),

  reset: () =>
    set({
      pending: 0,
      label: DEFAULT_LABEL,
      hint: DEFAULT_HINT,
    }),
}));

export function selectIsGlobalLoading(s: ApiLoadingState): boolean {
  return s.pending > 0;
}

/** Paths that poll / run in background — don't flash the global loader. */
export function shouldSkipGlobalLoader(path: string, method = "GET"): boolean {
  const url = path.toLowerCase();
  const m = (method || "GET").toUpperCase();

  if (
    url.includes("/notifications") &&
    (url.includes("feed=") || url.includes("live=") || url.includes("stats"))
  ) {
    return true;
  }
  // Session bootstrap — otherwise every page shows loader twice (auth then data)
  if (url.includes("/auth/me") || url.includes("/auth/refresh")) {
    return true;
  }
  if (url.includes("/auth/table-columns")) {
    return true;
  }
  // List pages already show their own loading UI — skip full-screen overlay on GETs
  if (
    m === "GET" &&
    (url.includes("/surveys") ||
      url.includes("/users") ||
      url.includes("/roles") ||
      url.includes("/voices") ||
      url.includes("/calls") ||
      url.includes("/responses") ||
      url.includes("/dashboard") ||
      url.includes("/reports") ||
      url.includes("/activity-logs") ||
      url.includes("/notifications")) &&
    !url.includes("/export")
  ) {
    return true;
  }
  return false;
}

/** Infer human label from HTTP method + URL (create / edit / upload / export / fetch). */
export function inferLoaderMessage(
  method: string,
  url: string
): Required<LoaderMessage> {
  const m = (method || "GET").toUpperCase();
  const u = url.toLowerCase();

  if (
    u.includes("export") ||
    u.includes("download") ||
    u.includes("results/export")
  ) {
    return { label: "Exporting", hint: "Preparing your file" };
  }

  if (
    u.includes("upload") ||
    u.includes("cloudinary") ||
    u.includes("contact-file") ||
    u.includes("questions-file")
  ) {
    return { label: "Uploading", hint: "Sending your file" };
  }

  if (m === "DELETE") {
    return { label: "Deleting", hint: "Removing data" };
  }

  if (m === "POST") {
    if (u.includes("/auth/login")) {
      return { label: "Signing in", hint: "Checking credentials" };
    }
    if (u.includes("duplicate") || u.includes("clone")) {
      return { label: "Copying", hint: "Duplicating record" };
    }
    if (u.includes("schedule")) {
      return { label: "Scheduling", hint: "Updating schedule" };
    }
    if (u.includes("sync")) {
      return { label: "Syncing", hint: "Refreshing catalog" };
    }
    return { label: "Saving", hint: "Creating your changes" };
  }

  if (m === "PUT" || m === "PATCH") {
    return { label: "Saving", hint: "Updating your changes" };
  }

  if (u.includes("/voices")) {
    return { label: "Loading voices", hint: "Fetching voice catalog" };
  }

  if (u.includes("/surveys") || u.includes("/agents")) {
    return { label: "Loading surveys", hint: "Fetching latest data" };
  }

  if (u.includes("/users")) {
    return { label: "Loading users", hint: "Fetching latest data" };
  }

  if (u.includes("/roles")) {
    return { label: "Loading roles", hint: "Fetching latest data" };
  }

  if (u.includes("/responses")) {
    return { label: "Loading responses", hint: "Fetching latest data" };
  }

  if (u.includes("/reports")) {
    return { label: "Loading reports", hint: "Fetching latest data" };
  }

  return { label: "Loading", hint: "Fetching latest data" };
}

/** Wrap any async work with the global loader (DRY helper). */
export async function withGlobalLoader<T>(
  work: Promise<T> | (() => Promise<T>),
  msg?: LoaderMessage
): Promise<T> {
  const store = useApiLoadingStore.getState();
  store.start(msg);
  try {
    return await (typeof work === "function" ? work() : work);
  } finally {
    store.stop();
  }
}
