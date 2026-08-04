"use client";

import { useRef, useState } from "react";
import { Download, ExternalLink, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppLoaderSpinner } from "@/components/ui/app-loader";
import { ClientContactsPreview } from "@/components/survey/client-contacts-preview";
import { downloadClientContactsSample } from "@/lib/constants/survey-upload-samples";
import { parseAndValidateClientContactsFile } from "@/lib/utils/client-contacts";
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
  const [formatErrors, setFormatErrors] = useState<string[]>([]);

  const handleUpload = async (file: File) => {
    const lower = file.name.toLowerCase();
    if (!/\.(csv|xlsx|xls)$/.test(lower)) {
      const msg = "Only Excel (.xlsx / .xls) or CSV files are allowed";
      setFormatErrors([msg]);
      toast.error(msg);
      return;
    }

    setUploading(true);
    setFormatErrors([]);
    try {
      const validated = await parseAndValidateClientContactsFile(file);
      if (!validated.ok) {
        setFormatErrors(validated.errors);
        toast.error("Invalid contact file — fix the errors and try again");
        return;
      }

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
        contacts:
          uploadedSurvey.config.clientContact.contacts?.length
            ? uploadedSurvey.config.clientContact.contacts
            : validated.contacts,
      });
      setFormatErrors([]);
      toast.success(
        `Uploaded ${validated.contacts.length} contact number(s)`
      );
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to upload file";
      setFormatErrors([msg]);
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clearFile = () => {
    setFormatErrors([]);
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
          Upload Excel or CSV with only one column:{" "}
          <span className="font-semibold text-foreground">contact</span>{" "}
          (phone numbers only).
        </p>
      </div>

      {/* How to format */}
      <div className="rounded-[8px] border border-border/60 bg-muted/20 px-4 py-3">
        <p className="text-xs font-semibold text-foreground">
          How to prepare your Excel / CSV
        </p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-[11px] leading-relaxed text-muted-foreground">
          <li>
            Open Excel or Google Sheets and create a new sheet.
          </li>
          <li>
            In cell <span className="font-medium text-foreground">A1</span>,
            type exactly:{" "}
            <span className="font-mono font-semibold text-foreground">
              contact
            </span>{" "}
            (this is the only column header allowed).
          </li>
          <li>
            From <span className="font-medium text-foreground">A2</span>{" "}
            downward, enter phone numbers only — digits, 10 to 15 characters
            (example:{" "}
            <span className="font-mono text-foreground">9876543210</span>).
          </li>
          <li>
            Do not add other columns (name, email, NUMBERS, etc.) — the file
            will be rejected.
          </li>
          <li>
            Do not use letters, spaces-only cells, or special characters in the
            number cells.
          </li>
          <li>
            Save as <span className="font-medium text-foreground">.xlsx</span>{" "}
            or <span className="font-medium text-foreground">.csv</span>, then
            upload below. You can also download the sample CSV first.
          </li>
        </ol>
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
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            {uploading ? <AppLoaderSpinner size="sm" /> : null}
            {uploading ? "Uploading…" : "Upload Excel or CSV"}
          </span>
          <span className="max-w-sm text-[11px] text-muted-foreground">
            Only column <span className="font-semibold">contact</span> with
            valid phone numbers will be accepted.
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

        {formatErrors.length > 0 ? (
          <div className="rounded-[8px] border border-destructive/30 bg-destructive/5 px-3 py-3">
            <p className="text-xs font-semibold text-destructive">
              Upload rejected — fix these issues:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-destructive">
              {formatErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        ) : null}

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
                  ? `${values.contacts.length} contact number(s) loaded`
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

      {values.contactFileUrl ||
      (values.contacts && values.contacts.length > 0) ? (
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
