"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AiExtractedData } from "@/types/response";

interface AiJsonViewerProps {
  data: AiExtractedData;
  className?: string;
}

function highlightJson(json: string): string {
  return json
    .replace(/"([^"]+)":/g, '<span class="text-sky-400">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="text-emerald-400">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span class="text-amber-400">$1</span>')
    .replace(/: (true|false)/g, ': <span class="text-violet-400">$1</span>')
    .replace(/: null/g, ': <span class="text-orange-400">null</span>');
}

export function AiJsonViewer({ data, className }: AiJsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const fullJson = useMemo(
    () => ({
      sentiment: data.sentiment,
      sentiment_score: data.sentimentScore,
      nps_score: data.npsScore ?? null,
      confidence: data.confidence,
      summary: data.summary,
      key_topics: data.keyTopics,
      entities: data.entities,
      flags: data.flags,
      ...data.rawExtraction,
    }),
    [data]
  );

  const formatted = JSON.stringify(fullJson, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[6px] border border-border/60 bg-[#0d1117] shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-violet-400" />
          <span className="text-xs font-medium text-white/80">
            AI Extracted JSON
          </span>
          <span className="rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-medium text-violet-300">
            {Math.round(data.confidence * 100)}% confidence
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <Check className="size-3 text-emerald-400" />
          ) : (
            <Copy className="size-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <pre
        className="max-h-80 overflow-auto p-4 font-mono text-xs leading-6 text-white/90"
        dangerouslySetInnerHTML={{ __html: highlightJson(formatted) }}
      />
    </div>
  );
}
