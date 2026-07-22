"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseImportFile } from "@/lib/utils/csv";
import { cn } from "@/lib/utils";
import type { CustomerImportRow } from "@/types/customer";

interface CustomersImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: CustomerImportRow[]) => Promise<void>;
  isLoading?: boolean;
}

export function CustomersImportModal({
  open,
  onOpenChange,
  onImport,
  isLoading,
}: CustomersImportModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CustomerImportRow[]>([]);
  const [error, setError] = useState<string>();
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const reset = useCallback(() => {
    setFile(null);
    setPreview([]);
    setError(undefined);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

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

  const handleImport = async () => {
    if (!file) return;
    const rows = await parseImportFile(file);
    await onImport(rows as CustomerImportRow[]);
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Customers</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to bulk import customers. Duplicate
            emails will be skipped.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-[6px] border-2 border-dashed px-6 py-10 transition-colors",
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || preview.length === 0 || isLoading || parsing}
          >
            {isLoading ? "Importing…" : "Import Customers"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
