import { createQueryString } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";

type QueryValue = string | number | boolean | undefined | null;
type QueryParams = Record<string, QueryValue>;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseError(response: Response): Promise<string> {
  const error = await response.json().catch(() => ({}));
  return (error as { message?: string }).message ?? "Request failed";
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
  return response.json() as Promise<T>;
}

/** Shared fetch for Next.js `/api/*` BFF routes */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const response = await fetch(path, {
    ...init,
    headers,
    cache: "no-store",
  });

  return parseJson<T>(response);
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
