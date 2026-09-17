import type { ReactNode } from "react";

export default function SurveyAnalyticsLayout({
  children,
}: {
  children: ReactNode;
}) {
  /* Fill the main pane (no leftover bottom gap) and still grow so 150% can scroll. */
  return (
    <div className="flex min-h-full min-w-0 w-full flex-1 flex-col">
      {children}
    </div>
  );
}
