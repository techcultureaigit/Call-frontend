"use client";

import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SettingsSectionCardProps {
  title: string;
  description?: string;
  helpTooltip?: string;
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  action?: React.ReactNode;
}

export function SettingsSectionCard({
  title,
  description,
  helpTooltip,
  children,
  className,
  gradient = "from-violet-500/8 via-transparent to-transparent",
  action,
}: SettingsSectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-card backdrop-blur-sm",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70",
          gradient
        )}
      />
      <div className="relative border-b border-border/40 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
                {helpTooltip && (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <HelpCircle className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        {helpTooltip}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {description && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action}
        </div>
      </div>
      <div className="relative space-y-4 px-5 py-5 sm:px-6">{children}</div>
    </motion.div>
  );
}
