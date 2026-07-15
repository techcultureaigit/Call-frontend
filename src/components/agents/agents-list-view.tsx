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
import { filterAgents, MOCK_AGENTS } from "@/lib/data/mock-agents";
import type { Agent } from "@/types/agent";
import { AgentCard } from "./agent-card";

export function AgentsListView() {
  const [search, setSearch] = useState("");
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "My Agents",
    breadcrumbs: [{ label: "Agents", href: "/agents" }, { label: "My Agents" }],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(
    () => filterAgents(agents, debouncedSearch),
    [agents, debouncedSearch]
  );

  const handleDelete = (agent: Agent) => {
    setAgents((prev) => prev.filter((a) => a.id !== agent.id));
    toast.success(`"${agent.name}" deleted`);
  };

  return (
    <div className="-mx-4 bg-gradient-to-br from-sky-100/70 via-sky-50/50 to-blue-50/40 px-4 pt-6 pb-4 lg:-mx-8 lg:px-8 dark:from-sky-950/25 dark:via-background dark:to-background">
      <PageContainer size="wide" className="px-0 py-0">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-[#1e3a5f] sm:text-3xl dark:text-sky-100">
              My Agents
            </h1>
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
                placeholder="Search agents by name..."
                className="h-11 rounded-xl border-border/50 bg-card pl-9 shadow-sm"
              />
            </div>
            <Button
              asChild
              className="h-11 shrink-0 rounded-xl px-5 shadow-sm"
            >
              <Link href="/agents/new">
                <UserPlus className="size-4" />
                Create New Agent
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/60 px-6 py-20 text-center shadow-sm backdrop-blur-sm">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <Bot className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No agents found</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {search
                  ? "Try a different search term."
                  : "Create your first voice AI agent to get started."}
              </p>
              {!search && (
                <Button asChild className="mt-4 rounded-xl">
                  <Link href="/agents/new">
                    <UserPlus className="size-4" />
                    Create New Agent
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((agent, i) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  index={i}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </motion.div>
      </PageContainer>
    </div>
  );
}
