import { authConfig } from "@/config/api";
import type { AuthTokens } from "@/types/auth";

const TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function setAuthCookies(tokens: AuthTokens): void {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:";
  const base = `path=/; max-age=${TOKEN_COOKIE_MAX_AGE}; samesite=lax${secure ? "; secure" : ""}`;

  document.cookie = `${authConfig.tokenKey}=${tokens.accessToken}; ${base}`;
  document.cookie = `${authConfig.refreshKey}=${tokens.refreshToken}; ${base}`;
}

export function clearAuthCookies(): void {
  if (typeof document === "undefined") return;

  const expired = "path=/; max-age=0; samesite=lax";
  document.cookie = `${authConfig.tokenKey}=; ${expired}`;
  document.cookie = `${authConfig.refreshKey}=; ${expired}`;
}
