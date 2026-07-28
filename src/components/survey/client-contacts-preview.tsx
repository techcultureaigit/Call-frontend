"use client";

import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import {
  fetchClientContactsFromUrl,
  type ClientContactRow,
} from "@/lib/utils/client-contacts";
import { cn } from "@/lib/utils";

interface ClientContactsPreviewProps {
  /** File URL — used to fetch rows dynamically */
  fileUrl?: string;
  /** Exact uploaded file name shown in UI */
  fileName?: string;
  /** Cached rows from upload parse (fallback / instant show) */
  contacts?: ClientContactRow[];
  className?: string;
  compact?: boolean;
  /**
   * When true and fileUrl is set, fetch rows from URL after mount
   * (even if cached contacts exist). Cached rows show first, then URL data replaces.
   */
  preferUrlFetch?: boolean;
}

export function ClientContactsPreview({
  fileUrl,
  fileName,
  contacts: initialContacts,
  className,
  compact = false,
  preferUrlFetch = false,
}: ClientContactsPreviewProps) {
  const [rows, setRows] = useState<ClientContactRow[]>(initialContacts ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromUrl, setFromUrl] = useState(false);

  const displayName = fileName?.trim() || "Uploaded file";

  const loadFromUrl = async (url: string) => {
    setLoading(true);
    setError("");
    try {
      const parsed = await fetchClientContactsFromUrl(url);
      setRows(parsed);
      setFromUrl(true);
      if (parsed.length === 0) {
        setError(
          "No contact rows found in file (expected name, phone, email, company)"
        );
      }
    } catch {
      setFromUrl(false);
      setRows((prev) => {
        const fallback = prev.length > 0 ? prev : initialContacts ?? [];
        setError("");
        return fallback.length > 0 ? fallback : prev;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = initialContacts ?? [];
    if (cached.length > 0) {
      setRows(cached);
      setFromUrl(false);
      setError("");
    }

    const url = fileUrl?.trim();
    if (url && (preferUrlFetch || cached.length === 0)) {
      void loadFromUrl(url);
      return;
    }

    if (cached.length === 0 && !url) {
      setRows([]);
      setError("");
      setFromUrl(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl, initialContacts?.length, preferUrlFetch]);

  if (!fileUrl && (!initialContacts || initialContacts.length === 0)) {
    return null;
  }

  return (
    <div
      className={cn(
        "space-y-3 rounded-[8px] border border-border/60 bg-card p-3 sm:p-4",
        className
      )}
    >
      <div className="min-w-0">
        <p className="inline-flex items-center gap-2 text-sm font-semibold">
          <Users className="size-4 text-primary" />
          Contact data
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {loading
            ? `Fetching from file URL…`
            : rows.length > 0
              ? `${rows.length} row(s) · ${displayName}${fromUrl ? " · from URL" : ""}`
              : displayName}
        </p>
      </div>

      {error ? (
        <p className="rounded-[6px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {loading && rows.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Fetching contacts from file URL…
        </div>
      ) : rows.length > 0 ? (
        <div className="overflow-x-auto rounded-[6px] border border-border/50">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-semibold">#</th>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Phone</th>
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Company</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`${row.email}-${row.phone}-${index}`}
                  className="border-b border-border/40 last:border-0"
                >
                  <td
                    className={cn(
                      "px-3 text-muted-foreground tabular-nums",
                      compact ? "py-1.5" : "py-2.5"
                    )}
                  >
                    {index + 1}
                  </td>
                  <td className={cn("px-3 font-medium", compact ? "py-1.5" : "py-2.5")}>
                    {row.name || "—"}
                  </td>
                  <td
                    className={cn(
                      "px-3 font-mono text-xs tabular-nums",
                      compact ? "py-1.5" : "py-2.5"
                    )}
                  >
                    {row.phone || "—"}
                  </td>
                  <td
                    className={cn(
                      "max-w-[200px] truncate px-3 text-muted-foreground",
                      compact ? "py-1.5" : "py-2.5"
                    )}
                    title={row.email}
                  >
                    {row.email || "—"}
                  </td>
                  <td className={cn("px-3", compact ? "py-1.5" : "py-2.5")}>
                    {row.company || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !error && !loading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No contact rows to show.
        </p>
      ) : null}
    </div>
  );
}
