"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Copy,
  GripVertical,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getQuestionTypeMeta } from "@/lib/constants/surveys";
import { cn } from "@/lib/utils";
import type { SurveyQuestion } from "@/types/survey";
import { QuestionFieldPreview } from "./question-field-preview";

interface SortableQuestionCardProps {
  question: SurveyQuestion;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function SortableQuestionCard({
  question,
  index,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}: SortableQuestionCardProps) {
  const meta = getQuestionTypeMeta(question.type);
  const Icon = meta.icon;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group relative rounded-2xl border bg-card shadow-card transition-all",
        selected
          ? "border-primary/50 ring-2 ring-primary/20"
          : "border-border/60 hover:border-border",
        isDragging && "z-10 opacity-90 shadow-elevated"
      )}
    >
      <div className="flex items-start gap-2 p-4 pb-2">
        <button
          type="button"
          className="mt-1 flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Q{index + 1}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium",
                meta.color
              )}
            >
              <Icon className="size-3" />
              {meta.label}
            </span>
            {question.conditionalLogic && question.conditionalLogic.length > 0 && (
              <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-400">
                Conditional
              </span>
            )}
          </div>

          <Input
            value={question.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="border-transparent bg-transparent px-0 text-base font-medium shadow-none focus-visible:border-border focus-visible:bg-muted/30"
            placeholder="Question title..."
          />

          <Input
            value={question.description ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="border-transparent bg-transparent px-0 text-sm text-muted-foreground shadow-none focus-visible:border-border focus-visible:bg-muted/30"
            placeholder="Add description (optional)"
          />

          <QuestionFieldPreview question={question} onUpdate={onUpdate} />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] text-muted-foreground">Required</span>
            <Switch
              checked={question.required}
              onCheckedChange={(v) => onUpdate({ required: v })}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
