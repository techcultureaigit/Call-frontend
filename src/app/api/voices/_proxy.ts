import { apiConfig } from "@/config/api";

const BACKEND = `${apiConfig.baseUrl}/voices`;

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

export function voicesBackendUrl(path = ""): string {
  return `${BACKEND}${path}`;
}
