"use client";

import { FileAudio } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function CallIntelPage() {
  return (
    <ModulePlaceholder
      title="Call Intel"
      description="AI-powered call intelligence, transcripts, sentiment analysis, and insights."
      icon={FileAudio}
    />
  );
}
