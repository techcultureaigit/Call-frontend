import type { ReactNode } from "react";

export default function SurveyAnalyticsLayout({
  children,
}: {
  children: ReactNode;
}) {
  /* Mobile: this shell scrolls. Desktop: overflow locked so the page stays fitted. */
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain md:overflow-hidden">
      {children}
    </div>
  );
}
