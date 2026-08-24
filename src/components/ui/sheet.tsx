"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function Sheet({ open, onOpenChange, children, className }: SheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[10px]"
            onClick={() => onOpenChange(false)}
          />
          <motion.aside
            key="sheet-panel"
            role="dialog"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.28 }}
            className={cn(
              "fixed top-0 right-0 bottom-0 z-50 m-0 flex h-dvh max-h-dvh w-full flex-col overflow-hidden rounded-none border-0 border-l border-border/80 bg-background shadow-[-24px_0_64px_-18px_rgba(15,23,42,0.38)] sm:max-w-md sm:rounded-l-[6px] md:max-w-lg",
              className
            )}
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function SheetHeader({
  children,
  onClose,
  className,
}: {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-start justify-between border-b border-border/60 px-6 py-5",
        className
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        onClick={onClose}
        className="ml-4 inline-flex size-8 shrink-0 items-center justify-center rounded-[6px] border border-border/60 bg-background text-muted-foreground shadow-subtle transition-colors hover:border-border hover:bg-muted hover:text-foreground"
        aria-label="Close"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function SheetContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-5", className)}>
      {children}
    </div>
  );
}

export function SheetFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("shrink-0 border-t border-border/60 px-6 py-4", className)}
    >
      {children}
    </div>
  );
}
