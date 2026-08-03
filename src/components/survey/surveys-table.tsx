"use client";

import type { ReactNode, MouseEvent } from "react";
import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  CalendarClock,
  Clock3,
  Copy,
  Eye,
  Languages,
  MessageSquareReply,
  Mic2,
  MessagesSquare,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissions } from "@/hooks";
import { getAgentLanguageLabel } from "@/lib/constants/agent-config";
import { formatAgentCreatedAt } from "@/lib/utils/date";
import {
  getSurveyDisplayStatus,
  isSurveyCompleted,
  isSurveyReadyToSchedule,
  isSurveyScheduled,
  type SurveyDisplayStatus,
} from "@/lib/utils/survey-readiness";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types/agent";
import { SurveyStatusBadge } from "./survey-status-badge";

interface SurveysTableProps {
  agents: Agent[];
  selectedIds: Set<string>;
  onSelectChange: (agentId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onClone: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onSchedule: (agent: Agent) => void;
}

const STATUS_ACCENT: Record<SurveyDisplayStatus, string> = {
  draft: "bg-amber-500",
  scheduled: "bg-emerald-500",
  processing: "bg-sky-500",
  completed: "bg-slate-400",
};

const STATUS_ROW_WASH: Record<SurveyDisplayStatus, string> = {
  draft: "hover:bg-amber-500/[0.04]",
  scheduled: "hover:bg-emerald-500/[0.04]",
  processing: "hover:bg-sky-500/[0.04]",
  completed: "hover:bg-slate-500/[0.04]",
};

export function SurveysTable({
  agents,
  selectedIds,
  onSelectChange,
  onSelectAll,
  onClone,
  onDelete,
  onSchedule,
}: SurveysTableProps) {
  const router = useRouter();
  const {
    isReady,
    canCreateSurvey,
    canUpdateSurvey,
    canDeleteSurvey,
  } = usePermissions();

  const openView = (agentId: string) => {
    router.push(`/survey/${agentId}`);
  };

  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>, agentId: string) => {
    const target = event.target as HTMLElement;
    if (
      target.closest(
        "a, button, input, label, [role='checkbox'], [data-row-ignore-click]"
      )
    ) {
      return;
    }
    openView(agentId);
  };

  const allSelected =
    agents.length > 0 && agents.every((agent) => selectedIds.has(agent.id));
  const someSelected =
    agents.some((agent) => selectedIds.has(agent.id)) && !allSelected;

  const columns = useMemo<ColumnDef<Agent>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            aria-label="Select all surveys on this page"
            className="size-4"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.has(row.original.id)}
            onChange={(e) =>
              onSelectChange(row.original.id, e.target.checked)
            }
            aria-label={`Select ${row.original.name}`}
            className="size-4"
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Survey",
        cell: ({ row }) => {
          const agent = row.original;
          return (
            <div className="min-w-0">
              <p
                className="truncate font-display text-[15px] font-semibold tracking-tight text-foreground"
                title={agent.name}
              >
                {agent.name}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                Voice survey · {formatAgentCreatedAt(agent.createdAt)}
              </p>
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <SurveyStatusBadge
            status={getSurveyDisplayStatus(row.original)}
            withDot
            size="md"
          />
        ),
      },
      {
        id: "language",
        header: "Language",
        cell: ({ row }) => {
          const language = getAgentLanguageLabel(
            row.original.config.persona.language || row.original.language
          );
          return (
            <MetaChip icon={Languages} label={language} />
          );
        },
      },
      {
        id: "voice",
        header: "Voice",
        cell: ({ row }) => {
          const voice =
            row.original.config.persona.tts.voice?.trim() || "—";
          return <MetaChip icon={Mic2} label={voice} />;
        },
      },
      {
        id: "maxDuration",
        header: "Duration",
        cell: ({ row }) => (
          <MetaChip
            icon={Clock3}
            label={`${row.original.config.persona.maxCallDurationMinutes} min`}
            tabular
          />
        ),
      },
      {
        id: "conversations",
        header: "Conversations",
        cell: ({ row }) => {
          const count = row.original.conversationCount;
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ring-1",
                count > 0
                  ? "bg-primary/10 text-primary ring-primary/15"
                  : "bg-muted/60 text-muted-foreground ring-border/50"
              )}
            >
              <MessagesSquare className="size-3.5 opacity-70" />
              {count}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const agent = row.original;
          const locked = isSurveyCompleted(agent);
          const canSchedule =
            canUpdateSurvey &&
            !locked &&
            !isSurveyScheduled(agent) &&
            isSurveyReadyToSchedule(agent);

          return (
            <div className="flex items-center justify-end gap-2">
              {locked ? (
                <Link
                  href={`/survey/${agent.id}/results`}
                  className="group/results inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-primary/25 bg-primary/8 px-2.5 text-[11px] font-semibold text-primary shadow-subtle transition-all duration-200 hover:border-primary/40 hover:bg-primary/14 hover:shadow-brand"
                  aria-label="View responses"
                >
          
                  Response
                </Link>
              ) : null}

              <div className="inline-flex h-8 items-center gap-0.5 rounded-[6px] border border-border/50 bg-muted/30 p-0.5 shadow-subtle backdrop-blur-sm transition-all duration-200 group-hover:border-border/80 group-hover:bg-card group-hover:shadow-card">
                <ActionButton
                  label="View details"
                  href={`/survey/${agent.id}`}
                  tone="sky"
                >
                  <Eye className="size-3.5" />
                </ActionButton>
                {canUpdateSurvey && !locked && (
                  <ActionButton
                    label="Edit survey"
                    href={`/survey/${agent.id}/configure`}
                    tone="emerald"
                  >
                    <Pencil className="size-3.5" />
                  </ActionButton>
                )}
                {canSchedule ? (
                  <ActionButton
                    label="Schedule survey"
                    onClick={() => onSchedule(agent)}
                    tone="amber"
                  >
                    <CalendarClock className="size-3.5" />
                  </ActionButton>
                ) : null}
                {isReady && canCreateSurvey && (
                  <ActionButton
                    label="Copy full survey"
                    onClick={() => onClone(agent)}
                    tone="teal"
                  >
                    <Copy className="size-3.5" />
                  </ActionButton>
                )}
                {canDeleteSurvey && !locked && (
                  <>
                    <span
                      aria-hidden
                      className="mx-0.5 h-4 w-px bg-border/70"
                    />
                    <ActionButton
                      label="Delete survey"
                      onClick={() => onDelete(agent)}
                      tone="danger"
                    >
                      <Trash2 className="size-3.5" />
                    </ActionButton>
                  </>
                )}
              </div>
            </div>
          );
        },
      },
    ],
    [
      allSelected,
      someSelected,
      selectedIds,
      onSelectChange,
      onSelectAll,
      onClone,
      onDelete,
      onSchedule,
      isReady,
      canCreateSurvey,
      canUpdateSurvey,
      canDeleteSurvey,
    ]
  );

  const table = useReactTable({
    data: agents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div className="relative overflow-hidden rounded-[6px] border border-border/60 bg-card/90 shadow-elevated backdrop-blur-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--brand)_14%,transparent),transparent_55%)]"
      />

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border/50 bg-muted/40"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground",
                      header.id === "select" && "w-12 px-3.5",
                      header.id === "actions" && "pr-5 text-right",
                      header.id === "name" && "pl-5"
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => {
              const selected = selectedIds.has(row.original.id);
              const status = getSurveyDisplayStatus(row.original);

              return (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.035, duration: 0.22 }}
                  onClick={(event) => handleRowClick(event, row.original.id)}
                  className={cn(
                    "group cursor-pointer border-b border-border/30 transition-colors last:border-0",
                    STATUS_ROW_WASH[status],
                    selected && "bg-primary/5"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "relative px-4 py-3.5 align-middle",
                        cell.column.id === "select" && "w-12 px-3.5",
                        cell.column.id === "actions" && "pr-5 text-right",
                        cell.column.id === "name" && "pl-5"
                      )}
                    >
                      {cell.column.id === "select" ? (
                        <span
                          aria-hidden
                          className={cn(
                            "pointer-events-none absolute inset-y-2 left-0 w-1 rounded-r-full opacity-80 transition-opacity group-hover:opacity-100",
                            STATUS_ACCENT[status]
                          )}
                        />
                      ) : null}
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetaChip({
  icon: Icon,
  label,
  tabular,
}: {
  icon: typeof Mic2;
  label: string;
  tabular?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-[140px] items-center gap-1.5 rounded-full bg-muted/45 px-2.5 py-1 text-xs font-medium text-foreground/80 ring-1 ring-border/40",
        tabular && "tabular-nums"
      )}
      title={label}
    >
      <Icon className="size-3 shrink-0 text-muted-foreground" aria-hidden />
      <span className="truncate">{label}</span>
    </span>
  );
}

function ActionButton({
  label,
  children,
  onClick,
  href,
  tone = "sky",
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: "sky" | "emerald" | "amber" | "teal" | "danger";
}) {
  const toneClass = {
    sky: "text-sky-700 hover:bg-sky-500/12 hover:text-sky-800 hover:ring-sky-500/20",
    emerald:
      "text-emerald-700 hover:bg-emerald-500/12 hover:text-emerald-800 hover:ring-emerald-500/20",
    amber:
      "text-amber-700 hover:bg-amber-500/12 hover:text-amber-800 hover:ring-amber-500/20",
    teal: "text-teal-700 hover:bg-teal-500/12 hover:text-teal-800 hover:ring-teal-500/20",
    danger:
      "text-red-600 hover:bg-red-500/12 hover:text-red-700 hover:ring-red-500/20",
  }[tone];

  const className = cn(
    "size-7 rounded-[5px] text-muted-foreground/80 transition-all duration-150",
    "hover:scale-105 hover:ring-1 active:scale-95",
    toneClass
  );

  if (href) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={className}
        asChild
        aria-label={label}
        title={label}
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
      className={className}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}
