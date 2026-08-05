/**
 * Shared helpers for module api.ts files (Survey module pattern).
 * Centralizes error handling, pagination meta, and optional debug logging.
 */
import { ApiError } from "@/api/http";
import type { PaginatedMeta } from "@/types";

/** Normalize ApiError / unknown errors into user-facing Error messages. */
export function unwrapApiError(error: unknown, fallback: string): Error {
  if (error instanceof ApiError) {
    return new Error(error.message || fallback);
  }
  if (error instanceof Error) return error;
  return new Error(fallback);
}

export interface PaginationInput {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Map backend pagination to frontend PaginatedMeta. */
export function toPaginatedMeta(
  pagination?: Partial<PaginationInput>,
  defaultLimit = 20
): PaginatedMeta {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? defaultLimit;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/** Share in-flight GETs (React Strict Mode remount / parallel callers → 1 network hit). */
const inflightRequests = new Map<string, Promise<unknown>>();

export function dedupeInflight<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inflightRequests.get(key);
  if (existing) return existing as Promise<T>;

  const pending = run().finally(() => {
    inflightRequests.delete(key);
  });
  inflightRequests.set(key, pending);
  return pending;
}

export type ModuleApiCallFn = <T>(
  name: string,
  method: string,
  url: string,
  run: () => Promise<T>,
  detail?: unknown
) => Promise<T>;

/** Optional debug wrapper — mirrors surveyCall() pattern per module. */
export function createModuleApiCall(moduleSlug: string): ModuleApiCallFn {
  const envKey = `NEXT_PUBLIC_${moduleSlug.toUpperCase().replace(/-/g, "_")}_API_DEBUG`;
  const debugEnabled =
    typeof process !== "undefined" &&
    (process.env as Record<string, string | undefined>)[envKey] !== "0" &&
    process.env.NODE_ENV !== "production";

  return async function moduleCall<T>(
    name: string,
    method: string,
    url: string,
    run: () => Promise<T>,
    detail?: unknown
  ): Promise<T> {
    const started = typeof performance !== "undefined" ? performance.now() : 0;
    const tag = `[${moduleSlug}-api]`;

    if (debugEnabled) {
      console.groupCollapsed(`${tag} ${name} · ${method} ${url}`);
      if (detail !== undefined) console.log("in", detail);
    }

    try {
      const result = await run();
      if (debugEnabled) {
        const ms =
          typeof performance !== "undefined"
            ? Math.round(performance.now() - started)
            : 0;
        console.log("ok", `${ms}ms`, result);
        console.groupEnd();
      }
      return result;
    } catch (error) {
      if (debugEnabled) {
        const ms =
          typeof performance !== "undefined"
            ? Math.round(performance.now() - started)
            : 0;
        console.error("fail", `${ms}ms`, error);
        console.groupEnd();
      }
      throw error;
    }
  };
}

/** Parse Content-Disposition header for blob export downloads. */
export function parseDownloadFilename(
  disposition: string | null,
  fallback: string
): string {
  if (!disposition) return fallback;
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim());
    } catch {
      return utfMatch[1].trim();
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(disposition);
  return plainMatch?.[1]?.trim() || fallback;
}
