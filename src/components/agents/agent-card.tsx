"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getAgentLanguageLabel } from "@/lib/constants/agent-config";
import { formatAgentCreatedAt } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types/agent";
import { AgentAvatar } from "./agent-avatar";

interface AgentCardProps {
  agent: Agent;
  index?: number;
  onDelete?: (agent: Agent) => void;
}

export function AgentCard({ agent, index = 0, onDelete }: AgentCardProps) {
  const voice = agent.config.persona.tts.voice ?? "—";
  const phone = agent.phone?.trim() ? agent.phone : "---";
  const language = getAgentLanguageLabel(agent.language);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(agent.uuid);
      toast.success("UUID copied to clipboard");
    } catch {
      toast.error("Failed to copy UUID");
    }
  };

  const handleDelete = () => {
    onDelete?.(agent);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="group"
    >
      <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-card transition-all duration-300 group-hover:border-primary/20 group-hover:shadow-elevated">
        <div className="bg-linear-to-r from-brand/10 via-brand/5 to-transparent px-4 py-3.5">
          <div className="flex items-center gap-3">
            <AgentAvatar seed={agent.uuid} />
            <h3 className="truncate text-base font-semibold tracking-tight text-foreground">
              {agent.name}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 px-4 py-4">
          <MetaField label="Voice" value={voice} />
          <MetaField label="Phone" value={phone} muted={phone === "---"} />
          <MetaField label="Language" value={language} />
          <MetaField
            label="Conversations"
            value={String(agent.conversationCount)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/40 px-4 py-3">
          <div className="min-w-0 space-y-0.5 text-[11px] leading-snug text-muted-foreground">
            <p className="truncate">
              Created: {formatAgentCreatedAt(agent.createdAt)}
            </p>
            <p className="truncate font-mono text-[10px]">
              UUID: {agent.uuid}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ActionButton
              label="Copy UUID"
              onClick={handleCopy}
              className="text-blue-600 hover:bg-blue-500/10 hover:text-blue-700"
            >
              <Copy className="size-3.5" />
            </ActionButton>
            <ActionButton
              label="Edit agent"
              href={`/agents/${agent.id}/configure`}
              className="text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
            >
              <Pencil className="size-3.5" />
            </ActionButton>
            <ActionButton
              label="Delete agent"
              onClick={handleDelete}
              className="text-red-600 hover:bg-red-500/10 hover:text-red-700"
            >
              <Trash2 className="size-3.5" />
            </ActionButton>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function MetaField({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 truncate text-sm font-semibold text-foreground dark:text-foreground",
          muted && "text-muted-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  label,
  children,
  className,
  onClick,
  href,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}) {
  if (href) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-8 rounded-full", className)}
        asChild
        aria-label={label}
      >
        <Link href={href}>{children}</Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("size-8 rounded-full", className)}
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </Button>
  );
}
