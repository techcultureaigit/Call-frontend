"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebarStore } from "@/stores";
import { useMounted } from "@/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function SidebarCollapseToggle({
  className,
}: {
  className?: string;
}) {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const mounted = useMounted();

  // Stable until mount so SSR HTML matches client hydration
  const collapsed = mounted ? isCollapsed : false;
  const label = collapsed ? "Show sidebar" : "Hide sidebar";

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={label}
            className={cn(
              // CSS hide below lg — avoids JS media-query hydration mismatch
              "hidden size-9 shrink-0 items-center justify-center rounded-[8px] lg:inline-flex",
              "-ml-0.5 text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
              "active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
              className
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" strokeWidth={2.1} />
            ) : (
              <PanelLeftClose className="size-5" strokeWidth={2.1} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
