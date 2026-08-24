"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { GlobalApiLoader } from "@/components/shared/global-api-loader";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          <GlobalApiLoader />
          {children}
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
