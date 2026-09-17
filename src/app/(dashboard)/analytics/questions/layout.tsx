import type { ReactNode } from "react";

export default function AnalyticsQuestionsLayout({
  children,
}: {
  children: ReactNode;
}) {
  /* Outer page scroll only (like My Surveys) — no nested scroll lock. */
  return (
    <div className="flex min-h-full min-w-0 w-full flex-1 flex-col">
      {children}
    </div>
  );
}
