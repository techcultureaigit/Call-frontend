import { create } from "zustand";
import { authConfig } from "@/config/api";
import {
  clearAuthCookies,
  clearLegacyAuthLocalStorage,
  getAuthTokensFromCookies,
  setAuthCookies,
} from "@/lib/auth/session";
import { clearTableColumnPrefsCache } from "@/components/shared/table-column-prefs";
import type { AuthSession, AuthTokens } from "@/types/auth";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  setSession: (session: AuthSession) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  hydrateFromCookies: () => void;
  setHydrated: (hydrated: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isHydrated: false,

  setSession: (session) => {
    setAuthCookies(session.tokens);
    clearLegacyAuthLocalStorage();
    set({
      user: session.user,
      tokens: session.tokens,
      isAuthenticated: true,
    });
  },

  setUser: (user) => set({ user }),

  clearSession: () => {
    clearAuthCookies();
    clearLegacyAuthLocalStorage();
    clearTableColumnPrefsCache();
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
    });
  },

  /** Restore tokens from cookies into memory (no localStorage). */
  hydrateFromCookies: () => {
    const tokens = getAuthTokensFromCookies();
    clearLegacyAuthLocalStorage();
    set({
      tokens,
      isAuthenticated: Boolean(tokens?.accessToken),
      isHydrated: true,
    });
  },

  setHydrated: (hydrated) => set({ isHydrated: hydrated }),
}));

export function getAuthRedirectPath(): string {
  return authConfig.defaultRedirect;
}
