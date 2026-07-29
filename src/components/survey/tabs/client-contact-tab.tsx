"use client";

import { useRef, useState } from "react";
import { Download, ExternalLink, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ClientContactsPreview } from "@/components/survey/client-contacts-preview";
import { downloadClientContactsSample } from "@/lib/constants/survey-upload-samples";
import { getContactFileOpenUrl } from "@/lib/utils/contact-file-url";
import { surveysModuleService } from "@/services/surveys-module.service";
import type { AgentClientContactConfig } from "@/types/agent";

interface ClientContactTabProps {
  surveyId?: string;
  values: AgentClientContactConfig;
  onChange: (values: AgentClientContactConfig) => void;
}

export function ClientContactTab({
  surveyId,
  values,
  onChange,
}: ClientContactTabProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    const lower = file.name.toLowerCase();
    if (!/\.(csv|xlsx|xls)$/.test(lower)) {
      toast.error("Only Excel (.xlsx / .xls) or CSV files are allowed");
      return;
    }

    setUploading(true);
    try {
      if (!surveyId) {
        throw new Error("Save previous steps first to upload contacts");
      }

      const uploadedSurvey = await surveysModuleService.uploadContactFile(
        surveyId,
        file
      );

      onChange({
        contactFileUrl:
          uploadedSurvey.config.clientContact.contactFileUrl ||
          values.contactFileUrl,
        contactFileName:
          uploadedSurvey.config.clientContact.contactFileName || file.name,
        contacts: uploadedSurvey.config.clientContact.contacts ?? [],
      });
      toast.success(
        `Uploaded ${
          uploadedSurvey.config.clientContact.contacts?.length ?? 0
        } row(s) — all columns saved`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clearFile = () => {
    onChange({
      contactFileUrl: "",
      contactFileName: "",
      contacts: [],
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">
          Contact of Client
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload any Excel or CSV — every column from the file is saved as-is.
        </p>
      </div>

      <div className="space-y-3 rounded-[8px] border border-border/60 bg-muted/20 p-4">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-border/70 bg-card px-4 py-10 text-center transition-colors hover:bg-muted/30 disabled:opacity-60"
        >
          <Upload className="size-6 text-muted-foreground" />
          <span className="text-sm font-medium">
            {uploading ? "Uploading…" : "Upload Excel or CSV"}
          </span>
          <span className="max-w-sm text-[11px] text-muted-foreground">
            Any columns accepted — no fixed field names required.
          </span>
        </button>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={downloadClientContactsSample}
            className="h-8 text-muted-foreground hover:text-foreground"
          >
            <Download className="size-3.5" />
            Download sample CSV
          </Button>
        </div>

        {values.contactFileUrl || values.contactFileName ? (
          <div className="flex items-start gap-3 rounded-[8px] border border-border/60 bg-card px-3 py-3">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {values.contactFileName || "Uploaded file"}
              </p>
              {values.contactFileUrl ? (
                <a
                  href={getContactFileOpenUrl(values.contactFileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1 text-[11px] text-brand hover:underline"
                >
                  <ExternalLink className="size-3 shrink-0" />
                  <span className="truncate">
                    {getContactFileOpenUrl(values.contactFileUrl)}
                  </span>
                </a>
              ) : null}
              <p className="text-[11px] text-muted-foreground">
                {values.contacts?.length
                  ? `${values.contacts.length} row(s) loaded`
                  : "File uploaded"}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={clearFile}
              aria-label="Remove uploaded file"
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : null}
      </div>

      {values.contactFileUrl || (values.contacts && values.contacts.length > 0) ? (
        <ClientContactsPreview
          fileUrl={values.contactFileUrl}
          contacts={values.contacts}
          fileName={values.contactFileName}
          compact
        />
      ) : null}
    </div>
  );
}
