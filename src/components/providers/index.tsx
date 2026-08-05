"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { GlobalApiLoader } from "./global-api-loader";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          {/* Single fullscreen loader — no NavigationLoader (avoids double flash) */}
          <GlobalApiLoader />
          {children}
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
