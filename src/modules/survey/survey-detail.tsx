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
import { AGENT_CONFIG_TABS as SURVEY_CONFIG_TABS, getAgentLanguageLabel as getSurveyLanguageLabel, getVoiceSpeedLabel, isAgentConfigTabDisabled as isSurveyConfigTabDisabled } from "@/lib/constants/agent-config";
import { getContactFileOpenUrl } from "@/lib/utils/contact-file-url";
import { formatAgentCreatedAt as formatSurveyCreatedAt } from "@/lib/utils/date";
import {
  resolveVoicePreviewUrl,
  stopVoiceRingtone,
} from "@/modules/voices/voice-playback";
import type { Agent as Survey } from "@/types/agent";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarClock, Clock, Copy, FileUp, Globe, MessageSquare, Mic, Pencil, Volume2, Bot } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
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

function PipelineStage({
  step,
  title,
  icon: Icon,
  provider,
  model,
}: {
  step: string;
  title: string;
  icon: LucideIcon;
  provider?: string;
  model?: string;
}) {
  const isConfigured = Boolean(provider?.trim() || model?.trim());

  return (
    <div className="rounded-[8px] border border-border/60 bg-background/80 p-3.5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[7px] bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {step}
          </p>
          <p className="font-display text-sm font-semibold text-foreground">
            {title}
          </p>
        </div>
      </div>
      <div className="mt-3 border-t border-border/45 pt-2.5">
        <p className="text-sm font-medium text-foreground">
          {provider?.trim() || "Not configured"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {model?.trim() ||
            (isConfigured ? "Default model" : `Choose ${title} in Edit survey`)}
        </p>
      </div>
    </div>
  );
}

/** View Details ordered by Create Survey stepper steps */
export function SurveyDetailView({ survey }: { survey: Survey }) {
  const router = useRouter();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [currentSurvey, setCurrentAgent] = useState(survey);
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

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const persona = currentSurvey.config.persona;
  const voice = persona.tts.voiceName?.trim() || "—";
  const voicePreviewUrl = persona.tts.voicePreviewUrl?.trim() || "";
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
                  <div className="md:col-span-2">
                    <DetailField label="Voice">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                        <Volume2 className="size-3.5 text-primary" />
                        {voice}
                      </span>
                      {voicePreviewUrl ? (
                        <audio
                          controls
                          preload="metadata"
                          src={resolveVoicePreviewUrl(voicePreviewUrl)}
                          className="mt-1.5 h-9 w-full max-w-72"
                          aria-label={`Listen to ${voice}`}
                          onPlay={stopVoiceRingtone}
                        >
                          Your browser does not support audio playback.
                        </audio>
                      ) : (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          No preview available
                        </p>
                      )}
                    </DetailField>
                  </div>
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
                  <PipelineStage
                    step="01 · STT"
                    title="Listen"
                    icon={Mic}
                    provider={stt.provider}
                    model={stt.model}
                  />
                  <PipelineStage
                    step="02 · LLM"
                    title="Reason"
                    icon={Bot}
                    provider={llm.provider}
                    model={llm.model}
                  />
                  <PipelineStage
                    step="03 · TTS"
                    title="Speak"
                    icon={Volume2}
                    provider={
                      [
                        tts.provider,
                        tts.voiceName,
                        tts.voiceName
                          ? getVoiceSpeedLabel(tts.tts_speed)
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    }
                    model={tts.model}
                  />
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
                              ![
                                "id",
                                "_id",
                                "type",
                                "options",
                                "instruction",
                                "conditions",
                                "__v",
                              ].includes(k) &&
                              typeof v === "string" &&
                              v.trim()
                          )
                          .map(([, v]) => String(v))[0] ||
                        "Untitled row";
                      const instruction =
                        (typeof q.instruction === "string" &&
                          q.instruction.trim()) ||
                        "";
                      const conditions = Array.isArray(q.conditions)
                        ? q.conditions.filter((row) => {
                            if (!row || typeof row !== "object") return false;
                            if (Array.isArray(row.thenShowQuestions)) {
                              return row.thenShowQuestions.some((item) =>
                                String(item?.question || "").trim()
                              );
                            }
                            const legacy = row as {
                              thenShowQuestion?: string;
                              thenShowQuestionId?: string;
                            };
                            return Boolean(
                              String(
                                legacy.thenShowQuestion ||
                                  legacy.thenShowQuestionId ||
                                  ""
                              ).trim()
                            );
                          })
                        : [];
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
                          {instruction ? (
                            <p className="mt-0.5 pl-5 text-xs text-muted-foreground">
                              {instruction}
                            </p>
                          ) : null}
                          {conditions.length > 0 ? (
                            <p className="mt-0.5 pl-5 text-xs text-muted-foreground">
                              {conditions
                                .map((row) => {
                                  const answer = String(row.ifAnswer || "").trim();
                                  const followUps = Array.isArray(
                                    row.thenShowQuestions
                                  )
                                    ? row.thenShowQuestions
                                        .map((item) =>
                                          String(item?.question || "").trim()
                                        )
                                        .filter(Boolean)
                                    : [
                                        String(
                                          (
                                            row as {
                                              thenShowQuestion?: string;
                                              thenShowQuestionId?: string;
                                            }
                                          ).thenShowQuestion ||
                                            (
                                              row as {
                                                thenShowQuestionId?: string;
                                              }
                                            ).thenShowQuestionId ||
                                            ""
                                        ).trim(),
                                      ].filter(Boolean);
                                  return `If ${answer} → ${followUps.join(" | ")}`;
                                })
                                .join("; ")}
                            </p>
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
                <DetailField label="Timing limit">
                  {`${getSurveySchedule(currentSurvey).callWindowStart || "09:00"} – ${getSurveySchedule(currentSurvey).callWindowEnd || "18:00"}`}
                </DetailField>
                <DetailField label="Start">
                  {getSurveySchedule(currentSurvey).startAt
                    ? formatSurveyCreatedAt(getSurveySchedule(currentSurvey).startAt!)
                    : "—"}
                </DetailField>
                <DetailField label="End">
                  {getSurveySchedule(currentSurvey).endAt
                    ? formatSurveyCreatedAt(getSurveySchedule(currentSurvey).endAt!)
                    : "—"}
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
