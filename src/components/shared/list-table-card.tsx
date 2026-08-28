"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ListTableCardProps {
  children: ReactNode;
  className?: string;
}

/** Single card shell: search/filters toolbar + embedded table (survey list pattern). */
export function ListTableCard({ children, className }: ListTableCardProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-elevated",
        className
      )}
    >
      {children}
    </div>
  );
}
