"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Clock,
  Copy,
  FileUp,
  Globe,
  MessageSquare,
  Mic,
  Pencil,
  Sparkles,
  Volume2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AGENT_CONFIG_TABS,
  getAgentLanguageLabel,
  isAgentConfigTabDisabled,
} from "@/lib/constants/agent-config";
import { formatAgentCreatedAt } from "@/lib/utils/date";
import type { Agent } from "@/types/agent";
import { SurveyAvatar } from "./survey-avatar";

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

function StepSection({
  step,
  title,
  upcoming,
  children,
}: {
  step: number;
  title: string;
  upcoming?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
          {step}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {upcoming ? (
          <Badge variant="outline" className="rounded-full text-[10px]">
            Upcoming
          </Badge>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function onOff(value: boolean): string {
  return value ? "On" : "Off";
}

/** View Details ordered by Create Survey stepper steps */
export function SurveyDetailDrawer({
  agent,
  open,
  onOpenChange,
  onClone,
}: {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClone?: (agent: Agent) => void;
}) {
  if (!agent) return null;

  const persona = agent.config.persona;
  const voice = persona.tts.voice?.trim() || "—";
  const language = getAgentLanguageLabel(persona.language || agent.language);
  const greeting = agent.config.prompts.greeting?.trim() || "—";
  const systemPrompt = agent.config.prompts.systemPrompt?.trim() || "—";
  const greetsFirst = agent.config.prompts.greetsFirst;
  const topics = agent.config.wisdom.topics ?? [];
  const knowledgeUrl = agent.config.wisdom.websiteUrls?.[0];
  const questions = agent.config.surveyQuestions.questions ?? [];
  const contact = agent.config.clientContact;
  const postCall = agent.config.postCall;
  const tools = agent.config.functions.tools ?? [];
  const actions = agent.config.functions.actions ?? [];
  const stt = persona.stt;
  const llm = persona.llm;
  const tts = persona.tts;

  const stepMeta = AGENT_CONFIG_TABS.map((tab, index) => ({
    step: index + 1,
    id: tab.id,
    title: tab.label,
    upcoming: isAgentConfigTabDisabled(tab.id),
  }));

  const handleCopyUuid = async () => {
    try {
      await navigator.clipboard.writeText(agent.uuid);
      toast.success("UUID copied to clipboard");
    } catch {
      toast.error("Failed to copy UUID");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[min(96vw,72rem)] max-w-[72rem] flex-col gap-0 overflow-hidden p-0 sm:rounded-[6px]">
        <DialogHeader className="shrink-0 border-b border-border/60 px-6 py-4 pr-12 text-left">
          <div className="flex items-start gap-3">
            <SurveyAvatar seed={agent.uuid} avatarId={persona.avatarId} />
            <div className="min-w-0">
              <DialogTitle>{agent.name}</DialogTitle>
              <DialogDescription className="sr-only">
                Survey details for {agent.name}
              </DialogDescription>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="rounded-full capitalize">
                  {agent.status}
                </Badge>
                <span>
                  {agent.conversationCount} conversation
                  {agent.conversationCount === 1 ? "" : "s"}
                </span>
                <span className="text-xs">
                  Created {formatAgentCreatedAt(agent.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-4">
          {/* Step 1 — Identity */}
          <StepSection step={1} title={stepMeta[0].title}>
            <div className="space-y-3 rounded-[6px] border border-border/50 bg-muted/20 p-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <DetailField label="Survey name">{agent.name}</DetailField>
                <DetailField label="Language">
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="size-3.5 text-primary" />
                    {language}
                  </span>
                </DetailField>
                <DetailField label="Voice">
                  <span className="inline-flex items-center gap-1.5">
                    <Volume2 className="size-3.5 text-primary" />
                    {voice}
                  </span>
                </DetailField>
                <DetailField label="Max duration">
                  {persona.maxCallDurationMinutes} min
                </DetailField>
                <DetailField label="Audio cache">
                  {onOff(persona.audioCacheEnabled)}
                </DetailField>
                <DetailField label="Realtime audio">
                  {onOff(persona.livekitInferenceEnabled)}
                </DetailField>
                <DetailField label="UUID">
                  <div className="flex items-center gap-2">
                    <code className="truncate font-mono text-xs">
                      {agent.uuid}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0"
                      onClick={handleCopyUuid}
                      aria-label="Copy UUID"
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                </DetailField>
                <DetailField label="Updated">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" />
                    {formatAgentCreatedAt(agent.updatedAt)}
                  </span>
                </DetailField>
              </div>

              <p className="pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Speech pipeline · Listen → Reason → Speak
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <DetailField label="01 · Listen (STT)">
                  <span className="inline-flex flex-col gap-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Mic className="size-3.5 text-primary" />
                      {stt.provider}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stt.model}
                    </span>
                  </span>
                </DetailField>
                <DetailField label="02 · Reason (LLM)">
                  <span className="inline-flex flex-col gap-0.5">
                    <span>{llm.provider}</span>
                    <span className="text-xs text-muted-foreground">
                      {llm.model}
                    </span>
                  </span>
                </DetailField>
                <DetailField label="03 · Speak (TTS)">
                  <span className="inline-flex flex-col gap-0.5">
                    <span>
                      {tts.provider}
                      {tts.voice ? ` · ${tts.voice}` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {tts.model}
                    </span>
                  </span>
                </DetailField>
              </div>
            </div>
          </StepSection>

          {/* Step 2 — Instructions */}
          <StepSection step={2} title={stepMeta[1].title}>
            <div className="space-y-3 rounded-[6px] border border-border/50 bg-muted/20 p-4">
              <DetailField label="Agent greetings">
                <span className="inline-flex gap-1.5">
                  <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{greeting}</span>
                </span>
              </DetailField>
              <DetailField label="Greets first">
                {onOff(greetsFirst)}
              </DetailField>
              <DetailField label="System prompt">
                <p className="whitespace-pre-wrap rounded-[6px] border border-border/40 bg-background/80 p-3 text-xs leading-relaxed text-muted-foreground">
                  {systemPrompt}
                </p>
              </DetailField>
            </div>
          </StepSection>

          {/* Step 3 — Survey Questions */}
          <StepSection step={3} title={stepMeta[2].title}>
            <div className="rounded-[6px] border border-border/50 bg-muted/20 p-4">
              <DetailField label="Enabled">
                {onOff(agent.config.surveyQuestions.enabled)}
              </DetailField>
              {questions.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No questions added.
                </p>
              ) : (
                <ul className="mt-3 space-y-1.5">
                  {questions.map((q, i) => (
                    <li key={q.id} className="text-sm">
                      <span className="font-medium text-muted-foreground">
                        {i + 1}.
                      </span>{" "}
                      {q.question}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({q.type})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </StepSection>

          {/* Step 4 — Contact of Client */}
          <StepSection step={4} title={stepMeta[3].title}>
            <div className="rounded-[6px] border border-border/50 bg-muted/20 p-4">
              {contact.contactFileName || contact.contactFileUrl ? (
                <DetailField label="Contact file">
                  <span className="inline-flex items-center gap-1.5">
                    <FileUp className="size-3.5 text-primary" />
                    {contact.contactFileName || contact.contactFileUrl}
                  </span>
                </DetailField>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No client contact file uploaded.
                </p>
              )}
            </div>
          </StepSection>

          {/* Step 5 — Knowledge */}
          <StepSection
            step={5}
            title={stepMeta[4].title}
            upcoming={stepMeta[4].upcoming}
          >
            <div className="rounded-[6px] border border-border/50 bg-muted/20 p-4">
              {topics.length === 0 && !knowledgeUrl ? (
                <p className="text-sm text-muted-foreground">
                  No knowledge added.
                </p>
              ) : (
                <div className="space-y-3">
                  {knowledgeUrl ? (
                    <DetailField label="Website URL">{knowledgeUrl}</DetailField>
                  ) : null}
                  {topics.length > 0 ? (
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Sparkles className="size-3.5" />
                        Topics
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {topics.map((topic) => (
                          <Badge
                            key={topic}
                            variant="outline"
                            className="rounded-full"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </StepSection>

          {/* Step 6 — Wrap-up */}
          <StepSection
            step={6}
            title={stepMeta[5].title}
            upcoming={stepMeta[5].upcoming}
          >
            <div className="grid gap-3 rounded-[6px] border border-border/50 bg-muted/20 p-4 sm:grid-cols-2">
              <DetailField label="Callback URL">
                {postCall.callbackUrl?.trim() || "—"}
              </DetailField>
              <DetailField label="Disposition buckets">
                {postCall.dispositionBuckets?.length
                  ? `${postCall.dispositionBuckets.length} bucket(s)`
                  : "None"}
              </DetailField>
            </div>
          </StepSection>

          {/* Step 7 — Tools */}
          <StepSection
            step={7}
            title={stepMeta[6].title}
            upcoming={stepMeta[6].upcoming}
          >
            <div className="rounded-[6px] border border-border/50 bg-muted/20 p-4">
              {tools.length === 0 && actions.length === 0 ? (
                <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Wrench className="size-3.5" />
                  No tools or actions configured.
                </p>
              ) : (
                <div className="space-y-2 text-sm">
                  {tools.length > 0 ? (
                    <DetailField label="Tools">
                      {tools.map((t) => t.name).join(", ")}
                    </DetailField>
                  ) : null}
                  {actions.length > 0 ? (
                    <DetailField label="Actions">
                      {actions.map((a) => a.name).join(", ")}
                    </DetailField>
                  ) : null}
                </div>
              )}
            </div>
          </StepSection>
        </div>

        <DialogFooter className="shrink-0 border-t border-border/60 px-6 py-4 sm:justify-stretch">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-[6px]"
            onClick={() => onClone?.(agent)}
          >
            <Copy className="size-4" />
            Copy full survey
          </Button>
          <Button asChild className="flex-1 rounded-[6px]">
            <Link href={`/survey/${agent.id}/configure`}>
              <Pencil className="size-4" />
              Edit survey
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
