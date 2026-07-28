"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, HelpCircle, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce, usePageMeta } from "@/hooks";
import {
  cloneAgent,
  deleteAgent,
  listAgents,
} from "@/lib/data/agents-repository";
import { filterAgents } from "@/lib/data/mock-agents";
import type { Agent } from "@/types/agent";
import { SurveyCard } from "./survey-card";
import { SurveyDetailDrawer } from "./survey-detail-drawer";

export function SurveyListView() {
  const [search, setSearch] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Agent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "My Surveys",
    breadcrumbs: [{ label: "Surveys", href: "/survey" }, { label: "My Surveys" }],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    const t = setTimeout(() => {
      setAgents(listAgents());
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(
    () => filterAgents(agents, debouncedSearch),
    [agents, debouncedSearch]
  );

  const handleViewDetails = (agent: Agent) => {
    setSelected(agent);
    setDrawerOpen(true);
  };

  const handleClone = (agent: Agent) => {
    const cloned = cloneAgent(agent.id);
    if (!cloned) {
      toast.error("Failed to copy survey");
      return;
    }
    setAgents(listAgents());
    toast.success(`Copied as "${cloned.name}"`);
  };

  const handleDelete = (agent: Agent) => {
    deleteAgent(agent.id);
    setAgents((prev) => prev.filter((a) => a.id !== agent.id));
    if (selected?.id === agent.id) {
      setDrawerOpen(false);
      setSelected(null);
    }
    toast.success(`"${agent.name}" deleted`);
  };

  return (
    <div className="bg-linear-to-b from-brand/5 to-transparent">
      <PageContainer size="full">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                My Surveys
              </h1>
              <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
                Listing shows Identity fields from Create Survey. View Details
                opens all steps (1–7).
              </p>
            </div>
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/80 text-muted-foreground shadow-sm transition-colors hover:bg-card"
              aria-label="Help"
            >
              <HelpCircle className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search surveys by name..."
                className="h-11 rounded-[6px] border-border/50 bg-card pl-9 shadow-sm"
              />
            </div>
            <Button
              asChild
              className="h-11 shrink-0 rounded-[6px] px-5 shadow-sm"
            >
              <Link href="/survey/new">
                <UserPlus className="size-4" />
                Create New Survey
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-[6px]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[6px] border border-dashed border-border/60 bg-card/60 px-6 py-20 text-center shadow-sm backdrop-blur-sm">
              <div className="mb-4 flex size-16 items-center justify-center rounded-[6px] bg-primary/10">
                <Bot className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No surveys found</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {search
                  ? "Try a different search term."
                  : "Create your first voice survey to get started."}
              </p>
              {!search && (
                <Button asChild className="mt-4 rounded-[6px]">
                  <Link href="/survey/new">
                    <UserPlus className="size-4" />
                    Create New Survey
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((agent, i) => (
                <SurveyCard
                  key={agent.id}
                  agent={agent}
                  index={i}
                  onViewDetails={handleViewDetails}
                  onClone={handleClone}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </motion.div>
      </PageContainer>

      <SurveyDetailDrawer
        agent={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onClone={handleClone}
      />
    </div>
  );
}
