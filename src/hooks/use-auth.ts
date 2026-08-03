"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { apiGet, apiPost, ApiClientError } from "@/lib/api";
import {
  mapBackendUser,
  type BackendAuthUser,
} from "@/lib/auth/map-session";
import { useAuthStore } from "@/stores";
import type { ApiResponse } from "@/types/api";
import type { User } from "@/types/user";

async function fetchBackendSession(): Promise<User | null> {
  try {
    const res = await apiGet<ApiResponse<BackendAuthUser>>("/auth/me", {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      // Unique URL so browser never serves a stale 304 for this session call
      params: { _ts: Date.now() },
    });
    if (!res.data) return null;
    return mapBackendUser(res.data);
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 401) {
      return null;
    }
    throw error;
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const tokens = useAuthStore((state) => state.tokens);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const hydrateFromCookies = useAuthStore((state) => state.hydrateFromCookies);

  useEffect(() => {
    if (!isHydrated) hydrateFromCookies();
  }, [hydrateFromCookies, isHydrated]);

  const hasToken = Boolean(tokens?.accessToken);

  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const nextUser = await fetchBackendSession();
      if (nextUser) setUser(nextUser);
      else if (hasToken) clearSession();
      return nextUser;
    },
    // Skip blocking refetch when login already populated user in memory
    enabled: isHydrated && hasToken && !user,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Keep Zustand in sync if React Query serves cached session data
  useEffect(() => {
    if (sessionQuery.data && !user) {
      setUser(sessionQuery.data);
    }
  }, [sessionQuery.data, user, setUser]);

  const logout = async () => {
    try {
      await apiPost("/auth/logout");
    } catch {
      // clear local session even if API fails
    } finally {
      clearSession();
      queryClient.clear();
    }
  };

  /**
   * Stay "loading" until cookies hydrate AND (if a token exists) the user
   * is in the store. Do not trust React Query isLoading alone — it can be
   * false for a frame before /auth/me starts, which caused false permission denies.
   */
  const isLoading =
    !isHydrated || (hasToken && !user && !sessionQuery.isError);

  return {
    user: user ?? sessionQuery.data ?? null,
    tokens,
    isAuthenticated: isAuthenticated || Boolean(user ?? sessionQuery.data),
    isHydrated,
    isLoading,
    isError: sessionQuery.isError,
    setSession,
    clearSession,
    logout,
    refetchSession: sessionQuery.refetch,
  };
}
