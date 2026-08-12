"use client";

/**
 * survey-detail.tsx
 * Read-only survey detail view. Route: /survey/[id]
 *
 * API calls in this file:
 *   duplicateSurvey() → POST /api/surveys/:id/duplicate
 *   scheduleSurvey()  → POST /api/surveys/:id/schedule
 */

import {
  duplicateSurvey,
  scheduleSurvey,
} from "./api";
import { getSurveyDisplayStatus, getSurveySchedule, isSurveyCompleted, isSurveyReadyToSchedule, isSurveyScheduled } from "./survey-lib";
import { SurveyStatusBadge, ScheduleSurveyDialog } from "./survey-dialogs";
import type { ScheduleSurveyPayload } from "./survey-dialogs";
import { ClientContactsPreview } from "./survey-tabs";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { usePageMeta, usePermissions } from "@/hooks";
import { AGENT_CONFIG_TABS as SURVEY_CONFIG_TABS, getAgentLanguageLabel as getSurveyLanguageLabel, isAgentConfigTabDisabled as isSurveyConfigTabDisabled } from "@/lib/constants/agent-config";
import { getContactFileOpenUrl } from "@/lib/utils/contact-file-url";
import { formatAgentCreatedAt as formatSurveyCreatedAt } from "@/lib/utils/date";
import {
  getPlayingVoiceId,
  subscribeVoicePlayback,
  toggleVoiceRingtone,
} from "@/modules/voices/voice-playback";
import type { Agent as Survey } from "@/types/agent";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarClock, Clock, Copy, FileUp, Globe, MessageSquare, Mic, Pencil, Volume2, Bot, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

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
export function SurveyDetailView({ survey }: { survey: Survey }) {
  const router = useRouter();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [currentSurvey, setCurrentAgent] = useState(survey);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(() =>
    getPlayingVoiceId()
  );
  const {
    isReady,
    canCreateSurvey,
    canUpdateSurvey,
  } = usePermissions();
  const locked = isSurveyCompleted(currentSurvey);
  const canSchedule =
    canUpdateSurvey &&
    !locked &&
    !isSurveyScheduled(currentSurvey) &&
    isSurveyReadyToSchedule(currentSurvey);
  const displayStatus = getSurveyDisplayStatus(currentSurvey);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: currentSurvey.name,
    breadcrumbs: [
      { label: "Surveys", href: "/survey" },
      { label: "My Surveys", href: "/survey" },
      { label: currentSurvey.name },
    ],
  });

  useEffect(() => {
    setCurrentAgent(survey);
  }, [survey]);

  useEffect(
    () => subscribeVoicePlayback(setPlayingVoiceId),
    []
  );

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const persona = currentSurvey.config.persona;
  const voice = persona.tts.voiceName?.trim() || "—";
  const voiceId = persona.tts.voice?.trim() || "";
  const voicePreviewUrl = persona.tts.voicePreviewUrl?.trim() || "";
  const isVoicePlaying = Boolean(voiceId && playingVoiceId === voiceId);
  const language = getSurveyLanguageLabel(persona.language || currentSurvey.language);
  const greeting = currentSurvey.config.prompts.greeting?.trim() || "—";
  const systemPrompt = currentSurvey.config.prompts.systemPrompt?.trim() || "—";
  const farewell = currentSurvey.config.prompts.farewell?.trim() || "—";
  const greetsFirst = currentSurvey.config.prompts.greetsFirst;
  const questions = currentSurvey.config.surveyQuestions.questions ?? [];
  const questionsFileUrl = currentSurvey.config.surveyQuestions.questionsFileUrl ?? "";
  const questionsFileName = currentSurvey.config.surveyQuestions.questionsFileName ?? "";
  const contact = currentSurvey.config.clientContact;
  const stt = persona.stt;
  const llm = persona.llm;
  const tts = persona.tts;

  const stepMeta = SURVEY_CONFIG_TABS.filter(
    (tab) => !isSurveyConfigTabDisabled(tab.id)
  ).map((tab, index) => ({
    step: index + 1,
    id: tab.id,
    title: tab.label,
  }));

  const handleClone = async () => {
    try {
      // API: duplicateSurvey() → POST /api/surveys/:id/duplicate
      const cloned = await duplicateSurvey(currentSurvey.id);
      toast.success(`Copied as "${cloned.name}"`);
      router.push("/survey");
    } catch {
      toast.error("Failed to copy survey");
    }
  };

  const confirmSchedule = async (payload: ScheduleSurveyPayload) => {
    try {
      // API: scheduleSurvey() → POST /api/surveys/:id/schedule
      const updated = await scheduleSurvey(
        currentSurvey.id,
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
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {currentSurvey.name}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <SurveyStatusBadge status={displayStatus} />
                  <span>
                    {currentSurvey.conversationCount} conversation
                    {currentSurvey.conversationCount === 1 ? "" : "s"}
                  </span>
                  <span className="text-xs">
                    Created {formatSurveyCreatedAt(currentSurvey.createdAt)}
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
                  Schedule survey
                </Button>
              ) : null}
              {isReady && canCreateSurvey && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-[6px]"
                  onClick={handleClone}
                >
                  <Copy className="size-4" />
                  Copy full survey
                </Button>
              )}
              {canUpdateSurvey && !locked && (
                <Button asChild className="rounded-[6px]">
                  <Link href={`/survey/${currentSurvey.id}/configure`}>
                    <Pencil className="size-4" />
                    Edit survey
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-5 rounded-[6px] border border-border/40 bg-card p-5 shadow-sm sm:p-6">
            <StepSection step={1} title={stepMeta[0].title}>
              <div className="space-y-3 rounded-[6px] border border-border/50 bg-muted/20 p-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <DetailField label="Survey name">{currentSurvey.name}</DetailField>
                  <DetailField label="Language">
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="size-3.5 text-primary" />
                      {language}
                    </span>
                  </DetailField>
                  <DetailField label="Voice">
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Volume2 className="size-3.5 text-primary" />
                        {voice}
                      </span>
                      {voiceId && voicePreviewUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            toggleVoiceRingtone(voiceId, voicePreviewUrl)
                          }
                          className="inline-flex h-7 items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
                          aria-label={
                            isVoicePlaying
                              ? `Pause ${voice}`
                              : `Listen to ${voice}`
                          }
                        >
                          {isVoicePlaying ? (
                            <Pause className="size-3" />
                          ) : (
                            <Play className="size-3" />
                          )}
                          {isVoicePlaying ? "Pause" : "Listen"}
                        </button>
                      ) : null}
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
                  <DetailField label="Updated">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5 text-primary" />
                      {formatSurveyCreatedAt(currentSurvey.updatedAt)}
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
                        {tts.voiceName ? ` · ${tts.voiceName}` : ""}
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
                <DetailField label="Survey greeting">
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
                  {onOff(currentSurvey.config.surveyQuestions.enabled)}
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
                    {questions.map((q, i) => {
                      const text =
                        (typeof q.question === "string" && q.question.trim()) ||
                        Object.entries(q)
                          .filter(
                            ([k, v]) =>
                              !["id", "_id", "type", "options", "__v"].includes(k) &&
                              typeof v === "string" &&
                              v.trim()
                          )
                          .map(([, v]) => String(v))[0] ||
                        "Untitled row";
                      return (
                        <li key={q.id} className="text-sm">
                          <span className="font-medium text-muted-foreground">
                            {i + 1}.
                          </span>{" "}
                          {text}
                          {q.type ? (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({String(q.type)})
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </StepSection>

            <StepSection step={4} title={stepMeta[3].title}>
              <div className="space-y-3 rounded-[6px] border border-border/50 bg-muted/20 p-4">
                <DetailField label="Survey farewell">
                  <span className="text-muted-foreground">{farewell}</span>
                </DetailField>
              </div>
            </StepSection>

            <StepSection step={5} title={stepMeta[4].title}>
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
                    />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No client contact file uploaded.
                  </p>
                )}
              </div>
            </StepSection>

            <StepSection step={6} title={stepMeta[5].title}>
              <div className="grid gap-3 rounded-[6px] border border-border/50 bg-muted/20 p-4 sm:grid-cols-2">
                <DetailField label="Status">
                  {isSurveyScheduled(currentSurvey) ? "Scheduled" : "Not scheduled"}
                </DetailField>
                <DetailField label="Recurrence">
                  {getSurveySchedule(currentSurvey).recurrence}
                </DetailField>
                <DetailField label="Start">
                  {getSurveySchedule(currentSurvey).startAt
                    ? formatSurveyCreatedAt(getSurveySchedule(currentSurvey).startAt!)
                    : "—"}
                </DetailField>
                <DetailField label="Timezone">
                  {getSurveySchedule(currentSurvey).timezone || "—"}
                </DetailField>
              </div>
            </StepSection>
          </div>
        </motion.div>
      </PageContainer>

      <ScheduleSurveyDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        survey={currentSurvey}
        onConfirm={confirmSchedule}
      />
    </div>
  );
}
