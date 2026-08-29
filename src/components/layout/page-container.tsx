import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "full";
  /** Fill available main height without extra vertical padding (list pages). */
  fullHeight?: boolean;
}

const sizeClasses = {
  default: "max-w-none",
  wide: "max-w-none",
  full: "max-w-none",
} as const;

export function PageContainer({
  children,
  className,
  size = "default",
  fullHeight = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto min-w-0 w-full px-4 lg:px-8",
        fullHeight
          ? "flex min-h-0 flex-1 flex-col overflow-hidden py-4"
          : "pt-6 pb-6",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}
