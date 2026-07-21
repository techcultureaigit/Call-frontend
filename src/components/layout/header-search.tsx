"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useKeyboardShortcut, useIsMobile } from "@/hooks";
import { useUIStore } from "@/stores";
import { cn } from "@/lib/utils";

export function HeaderSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useIsMobile();
  const openGlobalSearch = useUIStore((state) => state.openGlobalSearch);

  useKeyboardShortcut("k", () => {
    inputRef.current?.focus();
    openGlobalSearch();
  });

  if (isMobile) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={() => {
          openGlobalSearch();
          inputRef.current?.focus();
        }}
        aria-label="Search"
      >
        <Search className="size-4" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className={cn(
        "relative w-full max-w-md transition-shadow",
        isFocused && "drop-shadow-sm"
      )}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search surveys..."
        className={cn(
          "h-9 rounded-[6px] border-border/60 bg-muted/50 pl-9 pr-16 text-sm shadow-none transition-all",
          "placeholder:text-muted-foreground/70",
          "hover:bg-muted/70 hover:border-border",
          "focus-visible:bg-background focus-visible:border-brand/30 focus-visible:ring-1 focus-visible:ring-brand/20"
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            openGlobalSearch();
          }
        }}
        aria-label="Search"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-[6px] border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </motion.div>
  );
}
