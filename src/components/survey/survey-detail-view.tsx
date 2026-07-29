"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  Copy,
  FileUp,
  Globe,
  MessageSquare,
  Mic,
  Pencil,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks";
import {
  AGENT_CONFIG_TABS,
  getAgentLanguageLabel,
  isAgentConfigTabDisabled,
} from "@/lib/constants/agent-config";
import { surveysModuleService } from "@/services/surveys-module.service";
import { formatAgentCreatedAt } from "@/lib/utils/date";
import { getContactFileOpenUrl } from "@/lib/utils/contact-file-url";
import {
  getSurveyDisplayStatus,
  getSurveySchedule,
  isSurveyReadyToSchedule,
  isSurveyScheduled,
} from "@/lib/utils/survey-readiness";
import type { Agent } from "@/types/agent";
import { SurveyAvatar } from "./survey-avatar";
import { SurveyStatusBadge } from "./survey-status-badge";
import { ClientContactsPreview } from "./client-contacts-preview";
import {
  ScheduleSurveyDialog,
  type ScheduleSurveyPayload,
} from "./schedule-survey-dialog";

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
  children,
}: {
  step: number;
  title: string;
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
      </div>
      {children}
    </section>
  );
}

function onOff(value: boolean): string {
  return value ? "On" : "Off";
}

/** View Details ordered by Create Survey stepper steps */
export function SurveyDetailView({ agent }: { agent: Agent }) {
  const router = useRouter();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(agent);
  const canSchedule = isSurveyReadyToSchedule(currentAgent);
  const scheduled = isSurveyScheduled(currentAgent);
  const displayStatus = getSurveyDisplayStatus(currentAgent);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: currentAgent.name,
    breadcrumbs: [
      { label: "Surveys", href: "/survey" },
      { label: "My Surveys", href: "/survey" },
      { label: currentAgent.name },
    ],
  });

  useEffect(() => {
    setCurrentAgent(agent);
  }, [agent]);

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const persona = currentAgent.config.persona;
  const voice = persona.tts.voice?.trim() || "—";
  const language = getAgentLanguageLabel(persona.language || currentAgent.language);
  const greeting = currentAgent.config.prompts.greeting?.trim() || "—";
  const systemPrompt = currentAgent.config.prompts.systemPrompt?.trim() || "—";
  const greetsFirst = currentAgent.config.prompts.greetsFirst;
  const questions = currentAgent.config.surveyQuestions.questions ?? [];
  const questionsFileUrl = currentAgent.config.surveyQuestions.questionsFileUrl ?? "";
  const questionsFileName = currentAgent.config.surveyQuestions.questionsFileName ?? "";
  const contact = currentAgent.config.clientContact;
  const stt = persona.stt;
  const llm = persona.llm;
  const tts = persona.tts;

  const stepMeta = AGENT_CONFIG_TABS.filter(
    (tab) => !isAgentConfigTabDisabled(tab.id)
  ).map((tab, index) => ({
    step: index + 1,
    id: tab.id,
    title: tab.label,
  }));

  const handleCopyUuid = async () => {
    try {
      await navigator.clipboard.writeText(currentAgent.uuid);
      toast.success("UUID copied to clipboard");
    } catch {
      toast.error("Failed to copy UUID");
    }
  };

  const handleClone = async () => {
    try {
      const cloned = await surveysModuleService.duplicate(currentAgent.id);
      toast.success(`Copied as "${cloned.name}"`);
      router.push("/survey");
    } catch {
      toast.error("Failed to copy survey");
    }
  };

  const confirmSchedule = async (payload: ScheduleSurveyPayload) => {
    try {
      const updated = await surveysModuleService.schedule(
        currentAgent.id,
        payload
      );
      setCurrentAgent(updated);
      setScheduleOpen(false);
      toast.success(`"${updated.name}" scheduled`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to schedule survey"
      );
    }
  };

  const confirmUnschedule = async () => {
    try {
      const updated = await surveysModuleService.unschedule(currentAgent.id);
      setCurrentAgent(updated);
      setScheduleOpen(false);
      toast.success(`"${updated.name}" unscheduled`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unschedule survey"
      );
    }
  };

  return (
    <div className="bg-linear-to-b from-brand/5 to-transparent">
      <PageContainer size="full">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="mt-1 size-9 shrink-0 rounded-[6px]"
                onClick={() => router.push("/survey")}
                aria-label="Back to surveys"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <SurveyAvatar seed={currentAgent.uuid} avatarId={persona.avatarId} />
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {currentAgent.name}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <SurveyStatusBadge status={displayStatus} />
                  <span>
                    {currentAgent.conversationCount} conversation
                    {currentAgent.conversationCount === 1 ? "" : "s"}
                  </span>
                  <span className="text-xs">
                    Created {formatAgentCreatedAt(currentAgent.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
              {canSchedule ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-[6px]"
                  onClick={() => setScheduleOpen(true)}
                >
                  <CalendarClock className="size-4" />
                  {scheduled ? "Reschedule" : "Schedule survey"}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="rounded-[6px]"
                onClick={handleClone}
              >
                <Copy className="size-4" />
                Copy full survey
              </Button>
              <Button asChild className="rounded-[6px]">
                <Link href={`/survey/${currentAgent.id}/configure`}>
                  <Pencil className="size-4" />
                  Edit survey
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-5 rounded-[6px] border border-border/40 bg-card p-5 shadow-sm sm:p-6">
            <StepSection step={1} title={stepMeta[0].title}>
              <div className="space-y-3 rounded-[6px] border border-border/50 bg-muted/20 p-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <DetailField label="Survey name">{currentAgent.name}</DetailField>
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
                        {currentAgent.uuid}
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
                      {formatAgentCreatedAt(currentAgent.updatedAt)}
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

            <StepSection step={3} title={stepMeta[2].title}>
              <div className="space-y-3 rounded-[6px] border border-border/50 bg-muted/20 p-4">
                <DetailField label="Enabled">
                  {onOff(currentAgent.config.surveyQuestions.enabled)}
                </DetailField>

                {questionsFileName || questionsFileUrl ? (
                  <>
                    <DetailField label="Questions file">
                      <span className="inline-flex items-center gap-1.5">
                        <FileUp className="size-3.5 text-primary" />
                        {questionsFileName || "Uploaded file"}
                      </span>
                    </DetailField>
                    {questionsFileUrl ? (
                      <DetailField label="File URL">
                        <a
                          href={getContactFileOpenUrl(questionsFileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-brand hover:underline"
                        >
                          {getContactFileOpenUrl(questionsFileUrl)}
                        </a>
                      </DetailField>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No questions file uploaded (manual questions only).
                  </p>
                )}

                {questions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No questions added.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
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

            <StepSection step={4} title={stepMeta[3].title}>
              <div className="space-y-3 rounded-[6px] border border-border/50 bg-muted/20 p-4">
                {contact.contactFileName || contact.contactFileUrl ? (
                  <>
                    <DetailField label="Contact file">
                      <span className="inline-flex items-center gap-1.5">
                        <FileUp className="size-3.5 text-primary" />
                        {contact.contactFileName || "Uploaded file"}
                      </span>
                    </DetailField>
                    {contact.contactFileUrl ? (
                      <DetailField label="File URL">
                        <a
                          href={getContactFileOpenUrl(contact.contactFileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-brand hover:underline"
                        >
                          {getContactFileOpenUrl(contact.contactFileUrl)}
                        </a>
                      </DetailField>
                    ) : null}
                    <ClientContactsPreview
                      fileUrl={contact.contactFileUrl}
                      contacts={contact.contacts}
                      fileName={contact.contactFileName}
                      preferUrlFetch
                    />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No client contact file uploaded.
                  </p>
                )}
              </div>
            </StepSection>

            <StepSection step={5} title={stepMeta[4].title}>
              <div className="grid gap-3 rounded-[6px] border border-border/50 bg-muted/20 p-4 sm:grid-cols-2">
                <DetailField label="Status">
                  {scheduled ? "Scheduled" : "Not scheduled"}
                </DetailField>
                <DetailField label="Recurrence">
                  {getSurveySchedule(currentAgent).recurrence}
                </DetailField>
                <DetailField label="Start">
                  {getSurveySchedule(currentAgent).startAt
                    ? formatAgentCreatedAt(getSurveySchedule(currentAgent).startAt!)
                    : "—"}
                </DetailField>
                <DetailField label="Timezone">
                  {getSurveySchedule(currentAgent).timezone || "—"}
                </DetailField>
              </div>
            </StepSection>
          </div>
        </motion.div>
      </PageContainer>

      <ScheduleSurveyDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        agent={currentAgent}
        onConfirm={confirmSchedule}
        onUnschedule={confirmUnschedule}
      />
    </div>
  );
}
