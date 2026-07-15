"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  TEMPLATE_AI_MODEL_OPTIONS,
  TEMPLATE_CATEGORY_OPTIONS,
  TEMPLATE_LANGUAGE_OPTIONS,
  TEMPLATE_VOICE_OPTIONS,
} from "@/lib/constants/campaign-templates";
import type {
  CampaignTemplate,
  CreateTemplatePayload,
  TemplateCategory,
  TemplateLanguage,
  TemplateStatus,
  TemplateVoice,
  TemplateAiModel,
} from "@/types/campaign-template";

const SURVEY_OPTIONS = [
  { label: "Enterprise NPS Survey", value: "srv_001" },
  { label: "Lead Qualification v2", value: "srv_002" },
  { label: "Customer Satisfaction", value: "srv_003" },
  { label: "Custom Survey", value: "custom" },
];

interface CreateTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateTemplatePayload) => void;
  isLoading?: boolean;
  editTemplate?: CampaignTemplate | null;
}

const defaultForm = (): CreateTemplatePayload => ({
  name: "",
  description: "",
  category: "sales",
  language: "en",
  surveyId: "srv_001",
  surveyName: "Enterprise NPS Survey",
  voice: "professional",
  aiModel: "gpt-4o",
  status: "draft",
});

export function CreateTemplateModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  editTemplate,
}: CreateTemplateModalProps) {
  const [form, setForm] = useState<CreateTemplatePayload>(defaultForm);

  useEffect(() => {
    if (editTemplate && open) {
      setForm({
        name: editTemplate.name,
        description: editTemplate.description,
        category: editTemplate.category,
        language: editTemplate.language,
        surveyId: editTemplate.surveyId,
        surveyName: editTemplate.surveyName,
        voice: editTemplate.voice,
        aiModel: editTemplate.aiModel,
        status: editTemplate.status,
      });
    } else if (open && !editTemplate) {
      setForm(defaultForm());
    }
  }, [editTemplate, open]);

  const update = <K extends keyof CreateTemplatePayload>(
    key: K,
    value: CreateTemplatePayload[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSurveyChange = (surveyId: string) => {
    const survey = SURVEY_OPTIONS.find((o) => o.value === surveyId);
    update("surveyId", surveyId);
    update("surveyName", survey?.label ?? "Custom Survey");
  };

  const handleSave = (status: TemplateStatus) => {
    onSubmit({ ...form, status });
  };

  const categoryOptions = TEMPLATE_CATEGORY_OPTIONS.filter(
    (o) => o.value !== "all"
  ).map((o) => ({ label: o.label, value: o.value }));

  const languageOptions = TEMPLATE_LANGUAGE_OPTIONS.filter(
    (o) => o.value !== "all"
  ).map((o) => ({ label: o.label, value: o.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editTemplate ? "Edit Template" : "Create Template"}
          </DialogTitle>
          <DialogDescription>
            Configure a reusable campaign template with survey, voice, and AI
            settings.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-name">Template Name</Label>
            <Input
              id="tpl-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Enterprise NPS Outreach"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tpl-desc">Description</Label>
            <textarea
              id="tpl-desc"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the template purpose and use case..."
              rows={3}
              className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-subtle placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onChange={(e) =>
                  update("category", e.target.value as TemplateCategory)
                }
                options={categoryOptions}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select
                value={form.language}
                onChange={(e) =>
                  update("language", e.target.value as TemplateLanguage)
                }
                options={languageOptions}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Survey</Label>
            <Select
              value={form.surveyId ?? "srv_001"}
              onChange={(e) => handleSurveyChange(e.target.value)}
              options={SURVEY_OPTIONS}
              className="rounded-xl"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Voice</Label>
              <Select
                value={form.voice}
                onChange={(e) =>
                  update("voice", e.target.value as TemplateVoice)
                }
                options={TEMPLATE_VOICE_OPTIONS}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>AI Model</Label>
              <Select
                value={form.aiModel}
                onChange={(e) =>
                  update("aiModel", e.target.value as TemplateAiModel)
                }
                options={TEMPLATE_AI_MODEL_OPTIONS}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleSave("draft")}
            disabled={isLoading || !form.name.trim()}
            className="rounded-xl"
          >
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave("active")}
            disabled={isLoading || !form.name.trim()}
            className="rounded-xl"
          >
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
