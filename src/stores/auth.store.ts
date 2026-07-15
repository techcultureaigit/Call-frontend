import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authConfig } from "@/config/api";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/session";
import { storageKeys } from "@/lib/constants/storage-keys";
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
  setHydrated: (hydrated: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

function persistTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKeys.authToken, tokens.accessToken);
  localStorage.setItem(storageKeys.refreshToken, tokens.refreshToken);
}

function clearPersistedTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKeys.authToken);
  localStorage.removeItem(storageKeys.refreshToken);
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isHydrated: false,

      setSession: (session) => {
        persistTokens(session.tokens);
        setAuthCookies(session.tokens);
        set({
          user: session.user,
          tokens: session.tokens,
          isAuthenticated: true,
        });
      },

      setUser: (user) => set({ user }),

      clearSession: () => {
        clearPersistedTokens();
        clearAuthCookies();
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        });
      },

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: "crm-auth-store",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export function getAuthRedirectPath(): string {
  return authConfig.defaultRedirect;
}
