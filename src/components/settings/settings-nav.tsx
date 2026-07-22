"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SETTINGS_NAV } from "@/lib/constants/settings-navigation";
import type { SettingsSectionId } from "@/types/settings";

interface SettingsNavProps {
  active: SettingsSectionId;
  onChange: (id: SettingsSectionId) => void;
  className?: string;
}

export function SettingsNav({
  active,
  onChange,
  className,
}: SettingsNavProps) {
  return (
    <nav
      className={cn(
        "space-y-1 rounded-[6px] border border-border/50 bg-card/40 p-2 shadow-card backdrop-blur-md",
        className
      )}
    >
      <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Settings
      </p>
      {SETTINGS_NAV.map((item, i) => {
        const isActive = active === item.id;
        const Icon = item.icon;
        return (
          <motion.button
            key={item.id}
            type="button"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => onChange(item.id)}
            className={cn(
              "group relative flex w-full items-center gap-2.5 rounded-[6px] px-3 py-2.5 text-left text-sm transition-all",
              isActive
                ? item.danger
                  ? "font-medium text-destructive"
                  : "font-medium text-primary"
                : item.danger
                  ? "text-destructive/70 hover:bg-destructive/5 hover:text-destructive"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="settings-nav-active"
                className={cn(
                  "absolute inset-0 rounded-[6px] border",
                  item.danger
                    ? "border-destructive/20 bg-destructive/5"
                    : "border-primary/20 bg-primary/5"
                )}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon
              className={cn(
                "relative size-4 shrink-0",
                isActive
                  ? item.danger
                    ? "text-destructive"
                    : "text-primary"
                  : ""
              )}
            />
            <span className="relative truncate">{item.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
