/**
 * Shared BFF → Express proxy helpers (surveys / voices / roles / users).
 */
import { apiConfig } from "@/config/api";
import { NextResponse } from "next/server";

/** Forward browser Bearer token (and cookies) to Express */
export function backendAuthHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.Authorization = authorization;
  }

  const cookie = request.headers.get("cookie");
  if (cookie) {
    headers.Cookie = cookie;
  }

  return headers;
}

function mergeHeaders(
  base: Record<string, string>,
  extra?: HeadersInit
): Record<string, string> {
  if (!extra) return { ...base };

  const merged: Record<string, string> = { ...base };

  if (extra instanceof Headers) {
    extra.forEach((value, key) => {
      merged[key] = value;
    });
    return merged;
  }

  if (Array.isArray(extra)) {
    for (const [key, value] of extra) {
      merged[key] = value;
    }
    return merged;
  }

  return { ...merged, ...extra };
}

/** Build Express URL: `${NEXT_PUBLIC_API_URL}/{resource}{path}?query` */
export function backendUrl(
  resource: string,
  path = "",
  searchParams?: URLSearchParams | string
): string {
  const base = `${apiConfig.baseUrl.replace(/\/$/, "")}/${resource.replace(/^\//, "")}${path}`;
  const qs =
    typeof searchParams === "string"
      ? searchParams
      : searchParams?.toString() || "";
  return qs ? `${base}?${qs}` : base;
}

/** Parse backend body — avoids crash when upstream returns HTML */
export async function proxyJsonResponse(res: Response): Promise<NextResponse> {
  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json") || text.trim().startsWith("{")) {
    try {
      return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
      /* fall through */
    }
  }

  return NextResponse.json(
    {
      success: false,
      data: null,
      message:
        res.status === 404 || text.includes("<!DOCTYPE")
          ? `Backend unavailable or wrong API URL (${apiConfig.baseUrl}). Is the CRM API running?`
          : text.slice(0, 200) || "Upstream returned a non-JSON response",
    },
    { status: res.status >= 400 ? res.status : 502 }
  );
}

/** Proxy a request to Express and return JSON NextResponse */
export async function proxyToBackend(
  request: Request,
  resource: string,
  path = "",
  init: RequestInit = {}
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const url = backendUrl(resource, path, searchParams);

  try {
    const headers = mergeHeaders(backendAuthHeaders(request), init.headers);

    const res = await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
    });
    return proxyJsonResponse(res);
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: `Cannot reach CRM backend at ${apiConfig.baseUrl}. Is the API running?`,
      },
      { status: 502 }
    );
  }
}
