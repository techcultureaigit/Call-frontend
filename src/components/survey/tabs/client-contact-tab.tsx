"use client";

import { useRef, useState } from "react";
import { Download, ExternalLink, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadApi } from "@/api";
import { Button } from "@/components/ui/button";
import { ClientContactsPreview } from "@/components/survey/client-contacts-preview";
import { downloadClientContactsSample } from "@/lib/constants/survey-upload-samples";
import { parseClientContactsFromFile } from "@/lib/utils/client-contacts";
import type { AgentClientContactConfig } from "@/types/agent";

interface ClientContactTabProps {
  values: AgentClientContactConfig;
  onChange: (values: AgentClientContactConfig) => void;
}

export function ClientContactTab({ values, onChange }: ClientContactTabProps) {
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
      const contacts = await parseClientContactsFromFile(file);
      if (contacts.length === 0) {
        toast.error(
          "No valid rows found. Use columns: name, phone, email, company"
        );
        return;
      }

      const json = await uploadApi.cloudinary(file);

      if (!json.success || !json.data?.url) {
        throw new Error(json.message || "Upload failed");
      }

      onChange({
        contactFileUrl: json.data.url,
        contactFileName: json.data.fileName || file.name,
        contacts,
      });
      toast.success(
        json.data.mock
          ? `Saved ${contacts.length} contact(s) — file URL ready for fetch`
          : `Uploaded ${contacts.length} contact(s) — Cloudinary URL saved`
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
          Upload Excel or CSV — file URL is saved and rows are fetched below.
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
            Columns: name, phone, email, company — download the sample to see
            the format.
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
                  href={values.contactFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1 text-[11px] text-brand hover:underline"
                >
                  <ExternalLink className="size-3 shrink-0" />
                  <span className="truncate">{values.contactFileUrl}</span>
                </a>
              ) : null}
              <p className="text-[11px] text-muted-foreground">
                {values.contacts?.length
                  ? `${values.contacts.length} contact(s) loaded`
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
          preferUrlFetch
        />
      ) : null}
    </div>
  );
}
