"use client";

import { Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SurveyBuilderHeaderProps {
  name: string;
  onNameChange: (name: string) => void;
  published: boolean;
  onPublishToggle: (published: boolean) => void;
  onPreview: () => void;
  onSave: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
  dirty?: boolean;
  questionCount: number;
}

export function SurveyBuilderHeader({
  name,
  onNameChange,
  published,
  onPublishToggle,
  onPreview,
  onSave,
  isSaving,
  isPublishing,
  dirty,
  questionCount,
}: SurveyBuilderHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="h-9 max-w-xs border-transparent bg-transparent text-base font-semibold shadow-none focus-visible:border-border focus-visible:bg-muted/30 lg:max-w-sm"
          placeholder="Survey name..."
        />
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {questionCount} question{questionCount !== 1 ? "s" : ""}
          {dirty && (
            <span className="ml-2 text-amber-600 dark:text-amber-400">
              · Unsaved changes
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="outline" size="sm" onClick={onPreview} className="h-8">
          <Eye className="size-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={isSaving || !dirty}
          className={cn("h-8", dirty && "border-primary/40")}
        >
          <Save className="size-3.5" />
          <span className="hidden sm:inline">
            {isSaving ? "Saving…" : "Save"}
          </span>
        </Button>

        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {published ? "Published" : "Draft"}
          </span>
          <Switch
            checked={published}
            onCheckedChange={onPublishToggle}
            disabled={isPublishing}
          />
        </div>
      </div>
    </header>
  );
}
