"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QUESTION_TYPE_OPTIONS } from "@/lib/constants/surveys";
import type { QuestionType, SurveyQuestion } from "@/types/survey";
import { SortableQuestionCard } from "./sortable-question-card";

interface QuestionCanvasProps {
  questions: SurveyQuestion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: QuestionType) => void;
  onUpdate: (id: string, patch: Partial<SurveyQuestion>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function QuestionCanvas({
  questions,
  selectedId,
  onSelect,
  onAdd,
  onUpdate,
  onDelete,
  onDuplicate,
}: QuestionCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "question-canvas" });

  return (
    <main
      ref={setNodeRef}
      className={`flex flex-1 flex-col overflow-y-auto bg-gradient-to-b from-muted/20 to-background px-4 py-6 transition-colors lg:px-8 ${
        isOver ? "bg-primary/5" : ""
      }`}
    >
      <div className="mx-auto w-full max-w-2xl space-y-3">
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-card/50 px-8 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="size-7 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight">
              Start building your survey
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Drag a question type from the left panel or use the button below to
              add your first question.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="mt-6">
                  <Plus className="size-4" />
                  Add Question
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-52">
                {QUESTION_TYPE_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.type}
                    onClick={() => onAdd(opt.type)}
                  >
                    <opt.icon className="size-4" />
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <>
            {questions.map((question, index) => (
              <SortableQuestionCard
                key={question.id}
                question={question}
                index={index}
                selected={selectedId === question.id}
                onSelect={() => onSelect(question.id)}
                onUpdate={(patch) => onUpdate(question.id, patch)}
                onDelete={() => onDelete(question.id)}
                onDuplicate={() => onDuplicate(question.id)}
              />
            ))}

            <div className="flex justify-center pt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Plus className="size-4" />
                    Add Question
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-52">
                  {QUESTION_TYPE_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.type}
                      onClick={() => onAdd(opt.type)}
                    >
                      <opt.icon className="size-4" />
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
