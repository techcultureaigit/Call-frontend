"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { GenderIcon } from "@/components/library/voices/gender-icons";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import type { SelectOption } from "./select";

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
  "aria-label"?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled = false,
  className,
  emptyMessage = "No matches found",
  "aria-label": ariaLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q)
    );
  }, [options, query]);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-[6px] border border-border bg-card px-3.5 text-left text-sm shadow-subtle transition-[color,box-shadow,border-color] duration-200 hover:border-border focus-visible:border-brand focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50",
            open && "border-brand focus-visible:ring-brand/20",
            className
          )}
        >
          <span className="flex min-w-0 items-center gap-2 truncate font-medium text-foreground">
            {selected?.gender ? (
              <GenderIcon gender={selected.gender} className="size-3.5 shrink-0" />
            ) : null}
            <span className="truncate">{selected?.label ?? placeholder}</span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-48 p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b border-border/50 p-1.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 border-border/60 bg-card pl-8 text-sm shadow-none"
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
              aria-label={searchPlaceholder}
            />
          </div>
        </div>
        <div className="max-h-56 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          ) : (
            filtered.map((opt) => {
              const active = opt.value === value;
              return (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => onChange(opt.value)}
                  className={cn(
                    "cursor-pointer justify-between gap-2",
                    active && "bg-accent font-semibold"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2 truncate">
                    {opt.gender ? (
                      <GenderIcon gender={opt.gender} className="size-3.5 shrink-0" />
                    ) : null}
                    <span className="truncate">{opt.label}</span>
                  </span>
                  {active ? <Check className="size-3.5 shrink-0" /> : null}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
