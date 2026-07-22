"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SETTINGS_NAV } from "@/lib/constants/settings-navigation";
import type { SettingsSectionId } from "@/types/settings";

interface SettingsSearchProps {
  onSelect: (sectionId: SettingsSectionId) => void;
}

export function SettingsSearch({ onSelect }: SettingsSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return SETTINGS_NAV.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q)) ||
        item.description.toLowerCase().includes(q)
    );
  }, [query]);

  const showResults = focused && query.trim().length > 0;

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        placeholder="Search settings… (e.g. SMTP, 2FA, API keys)"
        className="h-10 rounded-[6px] border-border/60 bg-background/80 pl-9 pr-4"
      />

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[6px] border border-border/60 bg-popover shadow-elevated"
          >
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                No settings found for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <ul className="max-h-64 overflow-y-auto py-1">
                {results.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          onSelect(item.id);
                          setQuery("");
                          setFocused(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/60"
                      >
                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{item.label}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight className="size-3.5 text-muted-foreground" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
