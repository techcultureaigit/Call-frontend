"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Search, Volume2 } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDebounce, usePageMeta } from "@/hooks";
import {
  AGENT_TEMPLATE_INDUSTRIES,
  MOCK_AGENT_TEMPLATES,
  filterAgentTemplates,
} from "@/lib/data/mock-agent-templates";
import { AgentTemplateCard } from "./agent-template-card";
import { AgentTemplateDetailDrawer } from "./agent-template-detail-drawer";
import type { AgentTemplate } from "@/types/agent-template";

export function AgentTemplatesView() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<AgentTemplate | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Survey Template",
    breadcrumbs: [
      { label: "Agents", href: "/agents" },
      { label: "Survey Template" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const templates = useMemo(
    () =>
      filterAgentTemplates(
        MOCK_AGENT_TEMPLATES,
        debouncedSearch,
        industry
      ),
    [debouncedSearch, industry]
  );

  const handleViewDetails = (template: AgentTemplate) => {
    setSelected(template);
    setDrawerOpen(true);
  };

  return (
    <PageContainer size="full">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-8"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Conversational Voice AI for Your Business
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Pre-built agent templates for every industry. Deploy in minutes
              with optimized prompts, voices, and conversation flows.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center self-start rounded-xl border border-border/60 text-muted-foreground transition-colors hover:bg-muted lg:self-auto"
            aria-label="Help"
          >
            <HelpCircle className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/50 p-4 shadow-card backdrop-blur-md sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="h-10 rounded-xl border-border/60 bg-background/80 pl-9"
            />
          </div>
          <div className="w-full sm:w-52">
            <Select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              options={AGENT_TEMPLATE_INDUSTRIES}
              className="h-10 rounded-xl"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-20 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <Volume2 className="size-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No templates found</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Try a different search term or industry filter.
            </p>
            <Button
              variant="outline"
              className="mt-4 rounded-xl"
              onClick={() => {
                setSearch("");
                setIndustry("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((template, i) => (
              <AgentTemplateCard
                key={template.id}
                template={template}
                index={i}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {templates.length} template{templates.length !== 1 ? "s" : ""}{" "}
          available ·{" "}
          <Link href="/agents/new" className="font-medium text-primary hover:underline">
            Start from scratch
          </Link>
        </p>
      </motion.div>

      <AgentTemplateDetailDrawer
        template={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </PageContainer>
  );
}
