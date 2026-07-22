"use client";

import { useDraggable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { QUESTION_TYPE_OPTIONS } from "@/lib/constants/surveys";
import { cn } from "@/lib/utils";
import type { QuestionType } from "@/types/survey";

interface QuestionPaletteProps {
  onAdd: (type: QuestionType) => void;
}

function PaletteItem({
  type,
  label,
  description,
  icon: Icon,
  color,
  onAdd,
}: (typeof QUESTION_TYPE_OPTIONS)[number] & {
  onAdd: (type: QuestionType) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, fromPalette: true },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onAdd(type)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-[6px] border border-border/50 bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-card",
        isDragging && "opacity-40"
      )}
      {...listeners}
      {...attributes}
    >
      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", color)}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{description}</p>
      </div>
      <Plus className="ml-auto size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

export function QuestionPalette({ onAdd }: QuestionPaletteProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-muted/10 lg:flex xl:w-72">
      <div className="border-b border-border/60 px-4 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Add Question
        </h2>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Drag or click to add
        </p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {QUESTION_TYPE_OPTIONS.map((item) => (
          <PaletteItem key={item.type} {...item} onAdd={onAdd} />
        ))}
      </div>
    </aside>
  );
}
