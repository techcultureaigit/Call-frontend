import { apiConfig } from "@/config/api";
import { createQueryString } from "@/lib/utils";
import { getAccessTokenFromCookie } from "@/lib/auth/session";
import {
  inferLoaderMessage,
  shouldSkipGlobalLoader,
  useApiLoadingStore,
} from "@/components/shared/api-loading.store";
import type { ApiResponse } from "@/types/api";

type QueryValue = string | number | boolean | undefined | null;
type QueryParams = Record<string, QueryValue>;

/** Express resources mounted under NEXT_PUBLIC_API_URL (port 8000). */
const BACKEND_RESOURCES = new Set([
  "auth",
  "roles",
  "users",
  "surveys",
  "voices",
  "audio",
  "providers",
]);

export class ApiError extends Error {
  status: number;
  errors: unknown;

  constructor(message: string, status: number, errors: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

function getClientAccessToken(): string | null {
  return getAccessTokenFromCookie();
}

/**
 * Map browser paths to the real backend.
 * `/api/surveys/...` → `http://localhost:8000/api/v1/surveys/...`
 * Mock BFF-only routes (dashboard, notifications, …) stay on :3000.
 */
export function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  const match = /^\/api\/([^/?#]+)(.*)$/.exec(path);
  if (!match) return path;

  const resource = match[1];
  if (!BACKEND_RESOURCES.has(resource)) return path;

  const rest = match[2] ?? "";
  const base = apiConfig.baseUrl.replace(/\/$/, "");
  return `${base}/${resource}${rest}`;
}

async function parseErrorBody(response: Response): Promise<{
  message: string;
  errors: unknown;
}> {
  const error = (await response.json().catch(() => ({}))) as {
    message?: string;
    errors?: unknown;
  };
  return {
    message: error.message ?? "Request failed",
    errors: error.errors ?? null,
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const { message, errors } = await parseErrorBody(response);
    throw new ApiError(message, response.status, errors);
  }
  return response.json() as Promise<T>;
}

/** Shared fetch — real CRM APIs hit Express (:8000); mock BFF stays on Next (:3000) */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = resolveApiUrl(path);
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const token = getClientAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const track = !shouldSkipGlobalLoader(path, init.method ?? "GET");
  if (track) {
    useApiLoadingStore
      .getState()
      .start(inferLoaderMessage(init.method ?? "GET", path));
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
      credentials: "include",
    });
    return await parseJson<T>(response);
  } finally {
    if (track) useApiLoadingStore.getState().stop();
  }
}

export function apiGet<T>(path: string, params?: object): Promise<T> {
  const query = params ? createQueryString(params as QueryParams) : "";
  return apiRequest<T>(`${path}${query}`);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "DELETE" });
}

export function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: formData,
  });
}

/** Map `{ success, data }` API envelopes → `data` */
export async function unwrapData<T>(
  promise: Promise<ApiResponse<T>>
): Promise<T> {
  const json = await promise;
  return json.data;
}
