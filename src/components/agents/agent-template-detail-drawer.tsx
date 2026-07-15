"use client";

import { Clock, Globe, Sparkles, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import Link from "next/link";
import type { AgentTemplate } from "@/types/agent-template";

export function AgentTemplateDetailDrawer({
  template,
  open,
  onOpenChange,
}: {
  template: AgentTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!template) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-lg md:max-w-xl"
    >
      <SheetHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-start gap-3">
          <div
            className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-primary/10"
            style={{ backgroundColor: `${template.accent}18` }}
          >
            <Volume2 className="size-5" style={{ color: template.accent }} />
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

        <div className="grid gap-3 rounded-2xl border border-border/50 bg-muted/20 p-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tone
            </p>
            <p className="mt-1 text-sm">{template.tone}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Use Case
            </p>
            <p className="mt-1 text-sm">{template.useCase}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Setup Time
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm">
              <Clock className="size-3.5 text-primary" />
              ~{template.estimatedSetupMinutes} min
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Languages
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm">
              <Globe className="size-3.5 text-primary" />
              {template.languages.join(", ")}
            </p>
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

        <Button asChild className="w-full rounded-xl">
          <Link href={`/agents/new?template=${template.id}`}>
            + Create Agent from Template
          </Link>
        </Button>
      </SheetContent>
    </Sheet>
  );
}
