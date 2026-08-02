import { authConfig } from "@/config/api";
import { storageKeys } from "@/lib/constants/storage-keys";
import type { AuthTokens } from "@/types/auth";

const TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${escaped}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/** Read access + refresh tokens from cookies only (no localStorage). */
export function getAuthTokensFromCookies(): AuthTokens | null {
  const accessToken = getCookie(authConfig.tokenKey);
  if (!accessToken) return null;

  return {
    accessToken,
    refreshToken: getCookie(authConfig.refreshKey) ?? "",
    expiresIn: 0,
  };
}

export function getAccessTokenFromCookie(): string | null {
  return getCookie(authConfig.tokenKey);
}

export function setAuthCookies(tokens: AuthTokens): void {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:";
  const base = `path=/; max-age=${TOKEN_COOKIE_MAX_AGE}; samesite=lax${secure ? "; secure" : ""}`;

  document.cookie = `${authConfig.tokenKey}=${encodeURIComponent(tokens.accessToken)}; ${base}`;
  document.cookie = `${authConfig.refreshKey}=${encodeURIComponent(tokens.refreshToken)}; ${base}`;
}

export function clearAuthCookies(): void {
  if (typeof document === "undefined") return;

  const expired = "path=/; max-age=0; samesite=lax";
  document.cookie = `${authConfig.tokenKey}=; ${expired}`;
  document.cookie = `${authConfig.refreshKey}=; ${expired}`;
}

/** Remove legacy auth keys left from older clients. */
export function clearLegacyAuthLocalStorage(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(storageKeys.authToken);
  localStorage.removeItem(storageKeys.refreshToken);
  localStorage.removeItem("crm-auth-store");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
