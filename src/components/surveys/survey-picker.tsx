"use client";

import { ClipboardList, Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSurveys } from "@/hooks/use-surveys";
import { cn } from "@/lib/utils";

interface SurveyPickerProps {
  onSelect: (id: string) => void;
  onCreate: () => void;
  isCreating?: boolean;
}

export function SurveyPicker({ onSelect, onCreate, isCreating }: SurveyPickerProps) {
  const { data: surveys = [], isLoading } = useSurveys(false);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div>
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="size-8 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Survey Builder
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select a survey to edit or create a new one
          </p>
        </div>

        <Button onClick={onCreate} disabled={isCreating} size="lg" className="gap-2">
          {isCreating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Create New Survey
        </Button>

        <div className="space-y-3 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Existing Surveys
          </p>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {surveys.map((survey) => (
                <Card
                  key={survey.id}
                  className="cursor-pointer transition-all hover:border-primary/30 hover:shadow-card"
                  onClick={() => onSelect(survey.id)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <ClipboardList className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{survey.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {survey.questionCount} questions · ~
                        {survey.estimatedDurationMinutes} min
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-medium capitalize",
                        survey.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {survey.status}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
