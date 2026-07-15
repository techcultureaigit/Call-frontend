"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { authService } from "@/services";
import { useAuthStore } from "@/stores";
import type { ApiResponse } from "@/types/api";
import type { AuthSession } from "@/types/auth";

async function fetchLocalSession(): Promise<AuthSession> {
  const res = await fetch("/api/auth/me", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  const json = (await res.json()) as ApiResponse<AuthSession>;
  return json.data;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const tokens = useAuthStore((state) => state.tokens);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const session = await fetchLocalSession();
      setSession(session);
      return session;
    },
    enabled: isHydrated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
      queryClient.clear();
    }
  };

  return {
    user: sessionQuery.data?.user ?? user,
    tokens: sessionQuery.data?.tokens ?? tokens,
    isAuthenticated: isAuthenticated || Boolean(sessionQuery.data),
    isHydrated,
    isLoading: !isHydrated || sessionQuery.isLoading,
    isError: sessionQuery.isError,
    setSession,
    clearSession,
    logout,
    refetchSession: sessionQuery.refetch,
  };
}
