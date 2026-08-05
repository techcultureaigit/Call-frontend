"use client";

interface SurveyFetchLoaderProps {
  label?: string;
  hint?: string;
  className?: string;
}

/**
 * Placeholder only — fullscreen GlobalApiLoader handles the visible spinner.
 * Avoids a second in-page loader card on survey results.
 */
export function SurveyFetchLoader({
  className,
  label = "Loading",
}: SurveyFetchLoaderProps) {
  return (
    <div
      className={className ?? "min-h-40"}
      aria-busy="true"
      aria-label={label}
    />
  );
}
