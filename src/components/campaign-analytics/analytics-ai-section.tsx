"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Brain,
  Gauge,
  HelpCircle,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatPercent } from "@/lib/utils";
import { AnalyticsCard } from "./analytics-card";
import type { AiAnalytics } from "@/types/campaign-analytics";

export function AnalyticsAiSection({
  data,
  isLoading,
}: {
  data?: AiAnalytics;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl lg:col-span-1" />
        <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      label: "AI Conversation Score",
      value: `${data.conversationScore}/100`,
      icon: Sparkles,
      color: "text-violet-600",
    },
    {
      label: "Avg Confidence",
      value: `${data.avgConfidence}%`,
      icon: Brain,
      color: "text-blue-600",
    },
    {
      label: "Avg Response Time",
      value: `${(data.avgResponseTimeMs / 1000).toFixed(1)}s`,
      icon: Timer,
      color: "text-cyan-600",
    },
    {
      label: "Survey Completion",
      value: `${data.avgSurveyCompletion}%`,
      icon: Target,
      color: "text-emerald-600",
    },
    {
      label: "Response Accuracy",
      value: `${data.responseAccuracy}%`,
      icon: Gauge,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="rounded-xl bg-violet-500/10 p-2">
          <Bot className="size-4 text-violet-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            AI Analytics
          </h2>
          <p className="text-xs text-muted-foreground">
            Conversation intelligence and intent detection
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AnalyticsCard
          title="AI Performance"
          description="Core conversation metrics"
          gradient="from-violet-500/10 via-purple-500/5 to-transparent"
          className="lg:col-span-1"
        >
          <div className="space-y-3">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <m.icon className={cn("size-3.5", m.color)} />
                  <span className="text-xs text-muted-foreground">
                    {m.label}
                  </span>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {m.value}
                </span>
              </motion.div>
            ))}
          </div>
        </AnalyticsCard>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <AnalyticsCard
            title="Sentiment Analysis"
            description="AI-classified call sentiment"
            gradient="from-emerald-500/8 to-transparent"
          >
            <div className="space-y-3">
              {[
                { label: "Positive", value: data.sentiment.positive, color: "bg-emerald-500" },
                { label: "Neutral", value: data.sentiment.neutral, color: "bg-amber-500" },
                { label: "Negative", value: data.sentiment.negative, color: "bg-red-500" },
              ].map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-medium tabular-nums">{s.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={cn("h-full rounded-full", s.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AnalyticsCard>

          <AnalyticsCard
            title="Top Intent Detection"
            description="Most detected conversation intents"
            gradient="from-blue-500/8 to-transparent"
          >
            <div className="space-y-2">
              {data.topIntents.slice(0, 4).map((intent, i) => (
                <div
                  key={intent.intent}
                  className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium">{intent.intent}</span>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatPercent(intent.pct)}
                  </span>
                </div>
              ))}
            </div>
          </AnalyticsCard>

          <AnalyticsCard
            title="Most Asked Questions"
            description="Frequently surfaced survey questions"
            gradient="from-fuchsia-500/8 to-transparent"
            className="sm:col-span-2"
          >
            <div className="space-y-2">
              {data.topQuestions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border/40 px-3 py-2.5"
                >
                  <HelpCircle className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-relaxed">{q.question}</p>
                    <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
                      {q.count.toLocaleString()} occurrences
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AnalyticsCard>
        </div>
      </div>
    </div>
  );
}
