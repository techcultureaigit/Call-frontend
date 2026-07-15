"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Clock,
  Globe,
  HelpCircle,
  ListOrdered,
  Mic,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import {
  LANGUAGE_LABELS,
  TEMPLATE_AI_MODEL_OPTIONS,
  TEMPLATE_VOICE_OPTIONS,
} from "@/lib/constants/campaign-templates";
import { formatRelativeTime } from "@/lib/utils";
import { TemplateCategoryBadge } from "./template-category-badge";
import { TemplateIcon } from "./template-icon";
import { TemplateStatusBadge } from "./template-status-badge";
import type { CampaignTemplate } from "@/types/campaign-template";

export function TemplatePreviewDrawer({
  template,
  open,
  onOpenChange,
}: {
  template: CampaignTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!template) return null;

  const voiceLabel =
    TEMPLATE_VOICE_OPTIONS.find((o) => o.value === template.voice)?.label ??
    template.voice;
  const modelLabel =
    TEMPLATE_AI_MODEL_OPTIONS.find((o) => o.value === template.aiModel)
      ?.label ?? template.aiModel;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-lg md:max-w-xl lg:max-w-2xl"
    >
      <SheetHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-start gap-4">
          <TemplateIcon
            name={template.icon}
            accent={template.thumbnailAccent}
            className="size-12 rounded-2xl"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight">
              {template.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {template.surveyName}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <TemplateStatusBadge status={template.status} />
              <TemplateCategoryBadge category={template.category} />
            </div>
          </div>
        </div>
      </SheetHeader>

      <SheetContent className="space-y-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {template.description}
        </p>

        <div className="grid gap-3 rounded-2xl border border-border/50 bg-muted/20 p-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Est. Call Time
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <Clock className="size-3.5 text-primary" />
              {template.estimatedCallTimeMinutes} minutes
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Questions
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <HelpCircle className="size-3.5 text-primary" />
              {template.questionCount} total
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Voice
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <Mic className="size-3.5 text-primary" />
              {voiceLabel}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              AI Model
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              <Bot className="size-3.5 text-primary" />
              {modelLabel}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Globe className="size-3.5" />
            Supported Languages
          </p>
          <div className="flex flex-wrap gap-2">
            {template.languages.map((lang) => (
              <Badge
                key={lang}
                variant="outline"
                className="rounded-full px-2.5"
              >
                {LANGUAGE_LABELS[lang]}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <ListOrdered className="size-3.5" />
            Survey Flow
          </p>
          <div className="space-y-2">
            {template.surveyFlow.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/60 p-3"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  {step.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {step.questionIds.length} linked questions
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Questions
          </p>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border/50 p-2">
            {template.questions.map((q) => (
              <div
                key={q.id}
                className="rounded-lg bg-muted/30 px-3 py-2 text-sm"
              >
                <span className="mr-2 text-[10px] font-semibold text-muted-foreground">
                  Q{q.order}
                </span>
                {q.text}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3.5" />
            AI Prompt Preview
          </p>
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/5 p-4">
            <p className="font-mono text-xs leading-relaxed text-muted-foreground">
              {template.aiPromptPreview}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Last updated {formatRelativeTime(template.updatedAt)} ·{" "}
          {template.usageCount} campaigns launched
        </p>
      </SheetContent>
    </Sheet>
  );
}
