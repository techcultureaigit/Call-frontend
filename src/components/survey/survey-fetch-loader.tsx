"use client";

import { AppLoader } from "@/components/ui/app-loader";

interface SurveyFetchLoaderProps {
  label?: string;
  hint?: string;
  className?: string;
}

/** Survey alias of the shared AppLoader card — same design for fetch & search. */
export function SurveyFetchLoader({
  label = "Loading surveys",
  hint = "Please wait a moment",
  className,
}: SurveyFetchLoaderProps) {
  return (
    <AppLoader
      variant="page"
      label={label}
      hint={hint}
      className={className}
    />
  );
}
