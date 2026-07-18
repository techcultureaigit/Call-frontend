"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  backHref?: string;
  backLabel?: string;
}

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
  backHref = "/dashboard",
  backLabel = "Back to Dashboard",
}: ModulePlaceholderProps) {
  const { applyMeta, resetPageMeta } = usePageMeta({
    title,
    breadcrumbs: [{ label: title }],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  return (
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[50vh] flex-col items-center justify-center text-center"
      >
        <div className="relative mb-6 size-20">
          <div className="absolute inset-0 animate-pulse rounded-3xl bg-primary/10 blur-xl" />
          <div className="relative flex size-full items-center justify-center rounded-3xl border border-border/50 bg-card shadow-elevated">
            <Icon className="size-9 text-primary" />
            <Sparkles className="absolute -right-1 -top-1 size-4 text-amber-500" />
          </div>
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
        <Button asChild variant="outline" className="mt-6 rounded-xl">
          <Link href={backHref}>
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>
        </Button>
      </motion.div>
    </PageContainer>
  );
}
