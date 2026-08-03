"use client";

import { cn } from "@/lib/utils";

export type AppLoaderVariant = "page" | "section" | "compact" | "inline" | "overlay";

interface AppLoaderProps {
  label?: string;
  hint?: string;
  /** page / section / compact = same card | inline = spinner only | overlay = fixed global chip */
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
  spinnerSize = "lg",
}: {
  label: string;
  hint?: string;
  spinnerSize?: "md" | "lg";
}) {
  return (
    <div className="flex w-full max-w-[280px] flex-col items-center gap-5 rounded-[16px] border border-border/60 bg-card/95 px-8 py-9 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <AppLoaderSpinner size={spinnerSize} />
      <div className="space-y-1.5 text-center">
        <p className="text-[15px] font-semibold tracking-tight text-foreground">
          {label}
          <span className="ml-0.5 inline-block w-4 overflow-hidden align-bottom">
            <span className="inline-block animate-[survey-dots_1.2s_steps(4,end)_infinite]">
              ...
            </span>
          </span>
        </p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 animate-[survey-shimmer_1.2s_ease-in-out_infinite] rounded-full brand-gradient" />
      </div>
    </div>
  );
}

/**
 * One loader design for the whole app (card + rings).
 * `page` / `section` / `compact` all use the same card — no alternate bar UI.
 * `inline` = spinner only (buttons). `overlay` = fixed global chip.
 */
export function AppLoader({
  label = "Loading",
  hint = "Please wait a moment",
  variant = "page",
  className,
}: AppLoaderProps) {
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

  // page | section | compact → same card design
  const tall = variant === "page";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "relative overflow-hidden rounded-[14px]",
        tall ? "min-h-[58vh]" : "min-h-[40vh]",
        className
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 grid gap-5 p-1 sm:grid-cols-2 xl:grid-cols-3"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[10px] border border-border/30 bg-card/40 p-4"
          >
            <div className="mb-4 h-10 w-2/3 animate-pulse rounded-md bg-muted/60" />
            <div className="mb-2 h-3 w-full animate-pulse rounded bg-muted/40" />
            <div className="mb-6 h-3 w-4/5 animate-pulse rounded bg-muted/40" />
            <div className="grid grid-cols-4 gap-2">
              <div className="h-8 animate-pulse rounded bg-muted/35" />
              <div className="h-8 animate-pulse rounded bg-muted/35" />
              <div className="h-8 animate-pulse rounded bg-muted/35" />
              <div className="h-8 animate-pulse rounded bg-muted/35" />
            </div>
          </div>
        ))}
      </div>

      <div
        aria-hidden
        className="absolute inset-0 bg-background/50 backdrop-blur-[6px]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--brand)_14%,transparent)_0%,transparent_68%)]"
      />

      <div
        className={cn(
          "relative z-10 flex items-center justify-center p-6",
          tall ? "min-h-[58vh]" : "min-h-[40vh]"
        )}
      >
        <LoaderCard label={label} hint={hint} spinnerSize="lg" />
      </div>
    </div>
  );
}
