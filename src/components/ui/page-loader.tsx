"use client";

import { AppLoader } from "@/components/ui/app-loader";

interface PageLoaderProps {
  label?: string;
  hint?: string;
  className?: string;
}

/** @deprecated Prefer AppLoader — kept as alias so one design is used everywhere. */
export function PageLoader({
  label = "Loading",
  hint,
  className,
}: PageLoaderProps) {
  return (
    <AppLoader
      variant="page"
      label={label}
      hint={hint}
      className={className}
    />
  );
}
