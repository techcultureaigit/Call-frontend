import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { apiConfig, authConfig } from "@/config/api";
import { storageKeys } from "@/lib/constants/storage-keys";
import type { ApiErrorBody } from "@/types";

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly errors?: Record<string, string[]>;

  constructor(error: ApiErrorBody, statusCode: number) {
    super(error.message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.code = error.code;
    this.errors = error.errors;
  }
}

type TokenGetter = () => string | null;
type TokenRefresher = () => Promise<string | null>;
type UnauthorizedHandler = () => void;

interface ApiClientOptions {
  getAccessToken?: TokenGetter;
  refreshAccessToken?: TokenRefresher;
  onUnauthorized?: UnauthorizedHandler;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(storageKeys.authToken);
}

function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKeys.authToken);
  localStorage.removeItem(storageKeys.refreshToken);
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  const loginUrl = `${authConfig.loginPath}?redirect=${encodeURIComponent(currentPath)}`;
  window.location.assign(loginUrl);
}

function createAxiosInstance(options: ApiClientOptions = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: apiConfig.baseUrl,
    timeout: apiConfig.timeout,
    headers: apiConfig.headers,
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = options.getAccessToken?.() ?? getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorBody>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        options.refreshAccessToken
      ) {
        originalRequest._retry = true;

        try {
          const newToken = await options.refreshAccessToken();

          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch {
          clearStoredTokens();
          options.onUnauthorized?.() ?? redirectToLogin();
        }
      }

      if (error.response?.status === 401) {
        clearStoredTokens();
        options.onUnauthorized?.() ?? redirectToLogin();
      }

      const errorBody: ApiErrorBody = error.response?.data ?? {
        message: error.message || "An unexpected error occurred",
        statusCode: error.response?.status,
      };

      throw new ApiClientError(
        errorBody,
        error.response?.status ?? 500
      );
    }
  );

  return instance;
}

export const apiClient = createAxiosInstance({
  getAccessToken: getStoredToken,
});

export function configureApiClient(options: ApiClientOptions): AxiosInstance {
  return createAxiosInstance(options);
}

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function apiPost<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

export async function apiPut<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

export async function apiPatch<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}
