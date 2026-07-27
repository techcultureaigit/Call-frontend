"use client";

import { useState } from "react";
import { CloudUpload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AgentWisdomConfig } from "@/types/agent";

interface WisdomTabProps {
  values: AgentWisdomConfig;
  onChange: (values: AgentWisdomConfig) => void;
}

export function WisdomTab({ values, onChange }: WisdomTabProps) {
  const [urlInput, setUrlInput] = useState("");
  const [topicInput, setTopicInput] = useState("");

  const addUrl = () => {
    if (!urlInput.trim()) return;
    onChange({
      ...values,
      websiteUrls: [...values.websiteUrls, urlInput.trim()],
    });
    setUrlInput("");
  };

  const addTopic = () => {
    if (!topicInput.trim()) return;
    onChange({
      ...values,
      topics: [...values.topics, topicInput.trim()],
    });
    setTopicInput("");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label>Website URLs to reference</Label>
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addUrl()}
            placeholder="Enter website URL and press Enter"
            className="rounded-[6px]"
          />
          <Button onClick={addUrl} className="shrink-0 rounded-[6px]">
            <Plus className="size-4" />
            Add
          </Button>
        </div>
        {values.websiteUrls.length > 0 && (
          <ul className="space-y-1">
            {values.websiteUrls.map((url, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm"
              >
                {url}
                <button
                  type="button"
                  className="text-xs text-destructive"
                  onClick={() =>
                    onChange({
                      ...values,
                      websiteUrls: values.websiteUrls.filter(
                        (_, idx) => idx !== i
                      ),
                    })
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <Label>Custom Knowledge</Label>
        <textarea
          value={values.customKnowledge}
          onChange={(e) =>
            onChange({ ...values, customKnowledge: e.target.value })
          }
          rows={5}
          placeholder="Paste custom knowledge, FAQs, or product details..."
          className="w-full rounded-[6px] border border-input bg-transparent px-3 py-2 text-sm shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button variant="outline" className="rounded-[6px]">
          <CloudUpload className="size-4" />
          Upload File
        </Button>
      </div>

      <div className="space-y-3">
        <Label>
          What topics do you want to reference the agent from the knowledge
          base?
        </Label>
        <div className="flex gap-2">
          <Input
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTopic()}
            placeholder="Enter topic"
            className="rounded-[6px]"
          />
          <Button onClick={addTopic} className="shrink-0 rounded-[6px]">
            <Plus className="size-4" />
            Add
          </Button>
        </div>
        {values.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.topics.map((topic, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs font-medium"
              >
                {topic}
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...values,
                      topics: values.topics.filter((_, idx) => idx !== i),
                    })
                  }
                  className="text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
