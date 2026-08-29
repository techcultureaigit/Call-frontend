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
        className="inline-flex size-8 items-center justify-center rounded-md text-[#9aa5b8] transition-colors hover:bg-sidebar-hover hover:text-white"
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
        "relative w-full min-w-42 max-w-md transition-shadow sm:min-w-56",
        isFocused && "drop-shadow-sm"
      )}
    >
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#9aa5b8] sm:left-3 sm:size-4" />
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search surveys..."
        className={cn(
          "h-8 rounded-[6px] border-sidebar-border/60 bg-[#ffffff30] pl-8 pr-3 text-xs text-white shadow-none transition-all sm:h-9 sm:pl-9 sm:pr-14 sm:text-sm",
          "placeholder:text-[#9aa5b8]",
          "hover:border-sidebar-border hover:bg-[#ffffff40]",
          "focus-visible:border-[#3b82f6]/40 focus-visible:bg-[#ffffff45] focus-visible:ring-1 focus-visible:ring-[#3b82f6]/25"
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
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-[6px] border border-sidebar-border bg-sidebar-elevated px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#9aa5b8] lg:inline-flex">
        <span className="text-[10px]">⌘</span>K
      </kbd>
    </motion.div>
  );
}
