export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 30000),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

export const authConfig = {
  tokenKey: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? "crm_auth_token",
  refreshKey: process.env.NEXT_PUBLIC_AUTH_REFRESH_KEY ?? "crm_refresh_token",
  loginPath: "/login",
  defaultRedirect: "/dashboard",
} as const;

export type ApiConfig = typeof apiConfig;
export type AuthConfig = typeof authConfig;
