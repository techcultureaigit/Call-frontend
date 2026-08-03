"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  CalendarClock,
  ChartColumn,
  Clock3,
  Copy,
  Eye,
  Languages,
  MessagesSquare,
  Mic2,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getAgentLanguageLabel } from "@/lib/constants/agent-config";
import { formatAgentCreatedAt } from "@/lib/utils/date";
import {
  getSurveyDisplayStatus,
  isSurveyCompleted,
  isSurveyReadyToSchedule,
  isSurveyScheduled,
} from "@/lib/utils/survey-readiness";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks";
import type { Agent } from "@/types/agent";
import type { SurveyDisplayStatus } from "@/lib/utils/survey-readiness";
import { SurveyStatusBadge } from "./survey-status-badge";

interface SurveyCardProps {
  agent: Agent;
  index?: number;
  selected?: boolean;
  onSelectChange?: (agentId: string, selected: boolean) => void;
  onClone?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  onSchedule?: (agent: Agent) => void;
}

const STATUS_ACCENT: Record<SurveyDisplayStatus, string> = {
  draft: "bg-amber-500",
  scheduled: "bg-emerald-500",
  processing: "bg-violet-500",
  completed: "bg-slate-400",
};

export function SurveyCard({
  agent,
  index = 0,
  selected = false,
  onSelectChange,
  onClone,
  onDelete,
  onSchedule,
}: SurveyCardProps) {
  const {
    isReady,
    canCreateSurvey,
    canUpdateSurvey,
    canDeleteSurvey,
  } = usePermissions();
  const voice = agent.config.persona.tts.voice?.trim() || "—";
  const language = getAgentLanguageLabel(
    agent.config.persona.language || agent.language
  );
  const maxDuration = agent.config.persona.maxCallDurationMinutes;
  const locked = isSurveyCompleted(agent);
  const canSchedule =
    canUpdateSurvey &&
    !locked &&
    !isSurveyScheduled(agent) &&
    isSurveyReadyToSchedule(agent);
  const displayStatus = getSurveyDisplayStatus(agent);

  return (
    <article
      className="group transition-transform duration-200 hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[6px] border bg-card shadow-card transition-all duration-300 group-hover:border-primary/25 group-hover:shadow-elevated",
          selected ? "border-primary/40 ring-2 ring-primary/15" : "border-border/50"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0 left-0 w-0.75",
            STATUS_ACCENT[displayStatus]
          )}
        />

        {/* Header — solid gray band */}
        <div className="border-b border-border/50 bg-muted/70 pl-4 pr-4 pt-3.5 pb-3">
          <div className="flex items-start gap-2.5">
            <Checkbox
              checked={selected}
              onChange={(e) => onSelectChange?.(agent.id, e.target.checked)}
              aria-label={`Select ${agent.name}`}
              className="mt-1 size-4 shrink-0"
            />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3
                  className="min-w-0 flex-1 truncate text-[15px] font-semibold leading-snug tracking-tight text-foreground"
                  title={agent.name}
                >
                  {agent.name}
                </h3>
                <SurveyStatusBadge
                  status={displayStatus}
                  className="mt-0.5 shrink-0"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-xs text-muted-foreground">
                  {language}
                  <span className="mx-1.5 text-border">·</span>
                  {voice}
                </p>
                <p className="shrink-0 text-[11px] tabular-nums text-muted-foreground/80">
                  {formatAgentCreatedAt(agent.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats — equal columns with dividers */}
        <div className="grid grid-cols-4 divide-x divide-border/40 px-1 py-3.5">
          <MetaField icon={Mic2} label="Voice" value={voice} />
          <MetaField icon={Languages} label="Language" value={language} />
          <MetaField
            icon={Clock3}
            label="Max duration"
            value={`${maxDuration} min`}
          />
          <MetaField
            icon={MessagesSquare}
            label="Conversations"
            value={String(agent.conversationCount)}
          />
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/40 bg-muted/20 px-4 py-2.5">
          <div className="min-w-0">
            {locked ? (
              <Button
                asChild
                size="sm"
                className="group/result relative h-8 overflow-hidden rounded-[6px] px-3 text-xs font-semibold shadow-brand"
              >
                <Link href={`/survey/${agent.id}/results`}>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.28)_45%,transparent_65%)] opacity-0 transition-opacity duration-300 group-hover/result:opacity-100"
                  />
                  <ChartColumn className="size-3.5" />
                  Response
                </Link>
              </Button>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-0.5 rounded-[6px] border border-border/40 bg-card p-0.5">
            <ActionButton
              label="View details"
              href={`/survey/${agent.id}`}
              className="text-violet-600 hover:bg-violet-500/10 hover:text-violet-700"
            >
              <Eye className="size-3.5" />
            </ActionButton>
            {canUpdateSurvey && !locked && (
              <ActionButton
                label="Edit survey"
                href={`/survey/${agent.id}/configure`}
                className="text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
              >
                <Pencil className="size-3.5" />
              </ActionButton>
            )}
            {canSchedule ? (
              <ActionButton
                label="Schedule survey"
                onClick={() => onSchedule?.(agent)}
                className="text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
              >
                <CalendarClock className="size-3.5" />
              </ActionButton>
            ) : null}
            {isReady && canCreateSurvey && (
              <ActionButton
                label="Copy full survey"
                onClick={() => onClone?.(agent)}
                className="text-blue-600 hover:bg-blue-500/10 hover:text-blue-700"
              >
                <Copy className="size-3.5" />
              </ActionButton>
            )}
            {canDeleteSurvey && !locked && (
              <ActionButton
                label="Delete survey"
                onClick={() => onDelete?.(agent)}
                className="text-red-600 hover:bg-red-500/10 hover:text-red-700"
              >
                <Trash2 className="size-3.5" />
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function MetaField({
  label,
  value,
  icon: Icon,
  muted,
}: {
  label: string;
  value: string;
  icon: typeof Mic2;
  muted?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 px-2 text-center">
      <div className="flex items-center gap-1 text-muted-foreground/70">
        <Icon className="size-3 shrink-0" aria-hidden />
        <p className="text-[10px] font-medium uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p
        className={cn(
          "w-full truncate text-sm font-semibold tabular-nums text-foreground",
          muted && "text-muted-foreground"
        )}
        title={value}
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
        className={cn("size-7 rounded-[5px]", className)}
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
      className={cn("size-7 rounded-[5px]", className)}
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </Button>
  );
}
