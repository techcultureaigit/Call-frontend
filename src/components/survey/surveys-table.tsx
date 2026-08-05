"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  ClipboardList,
  Clock3,
  Copy,
  Eye,
  Languages,
  MessagesSquare,
  Mic2,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DataTable,
  DataTableActionButton,
  DataTableActionDivider,
  DataTableActionGroup,
  DataTableMetaChip,
  type DataTableColumn,
} from "@/components/shared/data-table";
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

  const allSelected =
    agents.length > 0 && agents.every((agent) => selectedIds.has(agent.id));
  const someSelected =
    agents.some((agent) => selectedIds.has(agent.id)) && !allSelected;

  const columns = useMemo<DataTableColumn<Agent>[]>(
    () => [
      {
        id: "select",
        showAccent: true,
        header: (
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            aria-label="Select all surveys on this page"
            className="size-4"
          />
        ),
        cell: (agent) => (
          <Checkbox
            checked={selectedIds.has(agent.id)}
            onChange={(e) => onSelectChange(agent.id, e.target.checked)}
            aria-label={`Select ${agent.name}`}
            className="size-4"
          />
        ),
      },
      {
        id: "name",
        header: "Survey",
        cellClassName: "pl-5",
        headerClassName: "pl-5",
        cell: (agent) => (
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
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (agent) => (
          <SurveyStatusBadge
            status={getSurveyDisplayStatus(agent)}
            withDot
            size="md"
          />
        ),
      },
      {
        id: "language",
        header: "Language",
        cell: (agent) => (
          <DataTableMetaChip
            icon={Languages}
            label={getAgentLanguageLabel(
              agent.config.persona.language || agent.language
            )}
          />
        ),
      },
      {
        id: "voice",
        header: "Voice",
        cell: (agent) => (
          <DataTableMetaChip
            icon={Mic2}
            label={agent.config.persona.tts.voice?.trim() || "—"}
          />
        ),
      },
      {
        id: "maxDuration",
        header: "Duration",
        cell: (agent) => (
          <DataTableMetaChip
            icon={Clock3}
            label={`${agent.config.persona.maxCallDurationMinutes} min`}
            tabular
          />
        ),
      },
      {
        id: "conversations",
        header: "Conversations",
        cell: (agent) => {
          const count = agent.conversationCount;
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
        align: "right",
        cell: (agent) => {
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
                  className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-primary/25 bg-primary/8 px-2.5 text-[11px] font-semibold text-primary shadow-subtle transition-all duration-200 hover:border-primary/40 hover:bg-primary/14 hover:shadow-brand"
                  aria-label="View responses"
                >
                  Response
                </Link>
              ) : null}

              <DataTableActionGroup>
                <DataTableActionButton
                  label="View details"
                  href={`/survey/${agent.id}`}
                  tone="sky"
                >
                  <Eye className="size-3.5" />
                </DataTableActionButton>
                {canUpdateSurvey && !locked && (
                  <DataTableActionButton
                    label="Edit survey"
                    href={`/survey/${agent.id}/configure`}
                    tone="emerald"
                  >
                    <Pencil className="size-3.5" />
                  </DataTableActionButton>
                )}
                {canSchedule ? (
                  <DataTableActionButton
                    label="Schedule survey"
                    onClick={() => onSchedule(agent)}
                    tone="amber"
                  >
                    <CalendarClock className="size-3.5" />
                  </DataTableActionButton>
                ) : null}
                {isReady && canCreateSurvey && (
                  <DataTableActionButton
                    label="Copy full survey"
                    onClick={() => onClone(agent)}
                    tone="teal"
                  >
                    <Copy className="size-3.5" />
                  </DataTableActionButton>
                )}
                {canDeleteSurvey && !locked && (
                  <>
                    <DataTableActionDivider />
                    <DataTableActionButton
                      label="Delete survey"
                      onClick={() => onDelete(agent)}
                      tone="danger"
                    >
                      <Trash2 className="size-3.5" />
                    </DataTableActionButton>
                  </>
                )}
              </DataTableActionGroup>
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

  return (
    <DataTable
      columns={columns}
      data={agents}
      getRowId={(agent) => agent.id}
      onRowClick={(agent) => router.push(`/survey/${agent.id}`)}
      emptyIcon={ClipboardList}
      emptyTitle="No surveys found"
      emptyDescription="Create a survey or adjust your filters."
      minWidthClassName="min-w-245"
      isRowSelected={(agent) => selectedIds.has(agent.id)}
      getRowAccentClassName={(agent) =>
        STATUS_ACCENT[getSurveyDisplayStatus(agent)]
      }
      getRowClassName={(agent) =>
        STATUS_ROW_WASH[getSurveyDisplayStatus(agent)]
      }
    />
  );
}
