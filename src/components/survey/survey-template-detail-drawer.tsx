"use client";

import type { ReactNode } from "react";
import { Clock, Globe, MessageSquare, Sparkles, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import Link from "next/link";
import { buildSystemPromptFromTemplate } from "@/lib/data/mock-survey-templates";
import type { SurveyTemplate } from "@/types/survey-template";

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

export function SurveyTemplateDetailDrawer({
  template,
  open,
  onOpenChange,
}: {
  template: SurveyTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!template) return null;

  const systemPrompt = buildSystemPromptFromTemplate(template);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-lg md:max-w-xl"
    >
      <SheetHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-start gap-3">
          <div
            className="flex size-12 items-center justify-center rounded-[6px] border border-white/10 bg-primary/10"
            style={{ backgroundColor: `${template.accent}18` }}
          >
            <User className="size-5" style={{ color: template.accent }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{template.name}</h2>
            <Badge variant="secondary" className="mt-1 rounded-full">
              {template.industryLabel}
            </Badge>
          </div>
        </div>
      </SheetHeader>

      <SheetContent className="space-y-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {template.description}
        </p>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Identity (Create Survey)
          </p>
          <div className="grid gap-3 rounded-[6px] border border-border/50 bg-muted/20 p-4 sm:grid-cols-2">
            <DetailField label="Survey name">{template.name}</DetailField>
            <DetailField label="Industry">{template.industryLabel}</DetailField>
            <DetailField label="Languages">
              <span className="inline-flex items-center gap-1.5">
                <Globe className="size-3.5 text-primary" />
                {template.languages.join(", ")}
              </span>
            </DetailField>
            <DetailField label="Setup time">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />~
                {template.estimatedSetupMinutes} min
              </span>
            </DetailField>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Instructions (Create Survey)
          </p>
          <div className="space-y-3 rounded-[6px] border border-border/50 bg-muted/20 p-4">
            <DetailField label="Tone">{template.tone}</DetailField>
            <DetailField label="Use case">{template.useCase}</DetailField>
            <DetailField label="Greeting">
              <span className="inline-flex gap-1.5">
                <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span className="text-muted-foreground">{template.greeting}</span>
              </span>
            </DetailField>
            <DetailField label="System prompt preview">
              <p className="whitespace-pre-wrap rounded-[6px] border border-border/40 bg-background/80 p-3 text-xs leading-relaxed text-muted-foreground">
                {systemPrompt}
              </p>
            </DetailField>
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3.5" />
            Included Features
          </p>
          <div className="flex flex-wrap gap-2">
            {template.features.map((f) => (
              <Badge key={f} variant="outline" className="rounded-full">
                {f}
              </Badge>
            ))}
          </div>
        </div>

        <Button asChild className="w-full rounded-[6px]">
          <Link href={`/survey/new?template=${template.id}`}>
            + Create Survey from Template
          </Link>
        </Button>
      </SheetContent>
    </Sheet>
  );
}
