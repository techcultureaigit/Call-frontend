import { apiConfig } from "@/config/api";
import { NextResponse } from "next/server";

const BACKEND = `${apiConfig.baseUrl}/surveys`;

/** Forward browser Bearer token (and cookies) to Express */
export function backendAuthHeaders(request: Request): HeadersInit {
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

export function surveysBackendUrl(path = ""): string {
  return `${BACKEND}${path}`;
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

export { BACKEND as SURVEYS_BACKEND };
