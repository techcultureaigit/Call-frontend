"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { PageContainer } from "@/components/layout";
import { FormPageHeader } from "@/components/shared/form-page-header";
import { Button } from "@/components/ui/button";
import { usePageMeta, useCustomerMutations } from "@/hooks";
import { parseImportFile } from "@/lib/utils/csv";
import { cn } from "@/lib/utils";
import type { CustomerImportRow } from "@/types/customer";

export function CustomersImportView() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CustomerImportRow[]>([]);
  const [error, setError] = useState<string>();
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const { importCustomers } = useCustomerMutations();

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Import Customers",
    breadcrumbs: [
      { label: "CRM", href: "/customers" },
      { label: "Customers", href: "/customers" },
      { label: "Import" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const processFile = async (f: File) => {
    setParsing(true);
    setError(undefined);
    try {
      const validExt =
        f.name.endsWith(".csv") ||
        f.name.endsWith(".xlsx") ||
        f.name.endsWith(".xls");
      if (!validExt) {
        setError("Please upload a CSV or Excel (.xlsx) file.");
        return;
      }

      const rows = await parseImportFile(f);
      if (rows.length === 0) {
        setError(
          "No valid rows found. Ensure columns include first_name, last_name, email, and company."
        );
        return;
      }

      setFile(f);
      setPreview(rows.slice(0, 5) as CustomerImportRow[]);
    } catch {
      setError("Failed to parse file. Check the format and try again.");
    } finally {
      setParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleImport = useCallback(async () => {
    if (!file) return;
    const rows = await parseImportFile(file);
    await importCustomers.mutateAsync(rows as CustomerImportRow[]);
    router.push("/customers");
  }, [file, importCustomers, router]);

  return (
    <PageContainer size="full">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full space-y-6"
      >
        <FormPageHeader
          backHref="/customers"
          backLabel="Back to customers"
          title="Import Customers"
          description="Upload a CSV or Excel file to bulk import customers. Duplicate emails will be skipped."
        />

        <div className="w-full space-y-4 rounded-xl border border-border/60 bg-card p-6 shadow-card lg:p-8">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Upload className="size-5 text-primary" />
            </div>
            <p className="mt-3 text-sm font-medium">
              Drop file here or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports CSV and Excel (.xlsx)
            </p>
          </div>

          {parsing && (
            <p className="text-center text-sm text-muted-foreground">
              Parsing file…
            </p>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </div>
          )}

          {file && preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileSpreadsheet className="size-4 text-muted-foreground" />
                <span className="font-medium">{file.name}</span>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
              <p className="text-xs text-muted-foreground">
                Preview (first {preview.length} rows):
              </p>
              <div className="overflow-hidden rounded-lg border border-border/60">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Email</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Company
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/30 last:border-0"
                      >
                        <td className="px-3 py-2">
                          {row.firstName} {row.lastName}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {row.email}
                        </td>
                        <td className="px-3 py-2">{row.company}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => router.push("/customers")}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={
                !file ||
                preview.length === 0 ||
                importCustomers.isPending ||
                parsing
              }
            >
              {importCustomers.isPending ? "Importing…" : "Import Customers"}
            </Button>
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
}
