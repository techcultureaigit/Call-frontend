"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/stores";
import type { ApiResponse } from "@/types/api";
import type { User } from "@/types/user";

async function fetchBackendSession(): Promise<User | null> {
  // Static login bypass — skip backend /auth/me call
  return null;
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

  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const nextUser = await fetchBackendSession();
      if (nextUser) setUser(nextUser);
      return nextUser ?? user;
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

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

  return {
    user: sessionQuery.data ?? user,
    tokens,
    isAuthenticated: isAuthenticated || Boolean(sessionQuery.data ?? user),
    isHydrated,
    isLoading: !isHydrated || sessionQuery.isLoading,
    isError: sessionQuery.isError,
    setSession,
    clearSession,
    logout,
    refetchSession: sessionQuery.refetch,
  };
}
