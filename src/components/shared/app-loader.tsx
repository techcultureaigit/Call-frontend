"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  selectIsGlobalLoading,
  useApiLoadingStore,
} from "@/components/shared/api-loading.store";

export type AppLoaderVariant =
  | "page"
  | "section"
  | "compact"
  | "inline"
  | "overlay"
  | "global";

interface AppLoaderProps {
  label?: string;
  hint?: string;
  /**
   * page / section / global → same fixed center popup (portal to body).
   * compact → local card | inline / overlay → small indicators
   */
  variant?: AppLoaderVariant;
  className?: string;
}

/** Shared spinner mark — same design everywhere. */
export function AppLoaderSpinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box =
    size === "sm" ? "size-5" : size === "lg" ? "size-[72px]" : "size-12";
  const ring =
    size === "sm"
      ? "border-2"
      : size === "lg"
        ? "border-[3px]"
        : "border-2";
  const core =
    size === "sm"
      ? "inset-1"
      : size === "lg"
        ? "inset-[18px]"
        : "inset-3";
  const dot =
    size === "sm" ? "size-1" : size === "lg" ? "size-2.5" : "size-1.5";

  return (
    <div className={cn("relative", box, className)} aria-hidden>
      {size !== "sm" ? (
        <span className="absolute inset-0 animate-[survey-orbit_3s_linear_infinite] rounded-full border border-dashed border-primary/30" />
      ) : null}
      <span
        className={cn(
          "absolute animate-[survey-spin_1s_linear_infinite] rounded-full border-primary/15 border-t-primary",
          ring,
          size === "sm" ? "inset-0" : "inset-2"
        )}
      />
      <span
        className={cn(
          "absolute flex items-center justify-center rounded-full brand-gradient shadow-glow",
          core
        )}
      >
        <span className={cn("rounded-full bg-white/95", dot)} />
      </span>
    </div>
  );
}

function LoaderCard({
  label,
  hint,
}: {
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex w-full max-w-56 flex-col items-center gap-3 rounded-[12px] border border-border/60 bg-card/95 px-5 py-4 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <AppLoaderSpinner size="md" />
      <div className="space-y-0.5 text-center">
        <p className="text-sm font-semibold tracking-tight text-foreground">
          {label}
          <span className="ml-0.5 inline-block w-4 overflow-hidden align-bottom">
            <span className="inline-block animate-[survey-dots_1.2s_steps(4,end)_infinite]">
              ...
            </span>
          </span>
        </p>
        {hint ? (
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <div className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 animate-[survey-shimmer_1.2s_ease-in-out_infinite] rounded-full brand-gradient" />
      </div>
    </div>
  );
}

/**
 * ONE fullscreen center popup for the whole app.
 * Portaled to document.body so parent transform/overflow never shifts it.
 */
function CenteredPopupLoader({
  label,
  hint,
}: {
  label: string;
  hint?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/55 p-6 backdrop-blur-[6px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--brand)_14%,transparent)_0%,transparent_68%)]"
      />
      <div className="relative z-10">
        <LoaderCard label={label} hint={hint} />
      </div>
    </div>,
    document.body
  );
}

/**
 * One loader design for the whole app.
 * Change this file once → page / section / global all update.
 */
export function AppLoader({
  label = "Loading",
  hint = "Please wait a moment",
  variant = "page",
  className,
}: AppLoaderProps) {
  const globalActive = useApiLoadingStore(selectIsGlobalLoading);

  if (variant === "inline") {
    return (
      <span
        role="status"
        aria-label={label}
        className={cn("inline-flex items-center justify-center", className)}
      >
        <AppLoaderSpinner size="sm" />
      </span>
    );
  }

  if (variant === "overlay") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn(
          "flex items-center gap-2.5 rounded-full border border-border/60 bg-card/95 px-3.5 py-2 shadow-lg backdrop-blur-md",
          className
        )}
      >
        <AppLoaderSpinner size="sm" />
        <span className="text-xs font-medium text-foreground">{label}…</span>
      </div>
    );
  }

  // compact: local in-panel card (tabs / nested panels)
  if (variant === "compact") {
    if (globalActive) {
      return <div aria-hidden className={cn("min-h-40", className)} />;
    }
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn(
          "relative flex min-h-40 items-center justify-center overflow-hidden rounded-[14px]",
          className
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-background/50 backdrop-blur-[6px]"
        />
        <div className="relative z-10 flex items-center justify-center p-4">
          <LoaderCard label={label} hint={hint} />
        </div>
      </div>
    );
  }

  // page | section | global → same body-portaled center popup
  if (variant !== "global" && globalActive) {
    return null;
  }

  return <CenteredPopupLoader label={label} hint={hint} />;
}
