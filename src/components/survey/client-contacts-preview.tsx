"use client";

import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { AppLoader } from "@/components/ui/app-loader";
import {
  fetchClientContactsFromUrl,
  sanitizeContactRows,
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
  const cachedContacts = useMemo(
    () => sanitizeContactRows(initialContacts),
    [initialContacts]
  );
  const [rows, setRows] = useState<ClientContactRow[]>(cachedContacts);
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
        setError("No contact rows found in file");
      }
    } catch (err) {
      setFromUrl(false);
      setRows((prev) => {
        const fallback = prev.length > 0 ? prev : cachedContacts;
        if (fallback.length === 0) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load contacts from URL"
          );
        } else {
          setError("");
        }
        return fallback.length > 0 ? fallback : prev;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cachedContacts.length > 0) {
      setRows(cachedContacts);
      setFromUrl(false);
      setError("");
    }

    const url = fileUrl?.trim();
    if (url && (preferUrlFetch || cachedContacts.length === 0)) {
      void loadFromUrl(url);
      return;
    }

    if (cachedContacts.length === 0 && !url) {
      setRows([]);
      setError("");
      setFromUrl(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl, cachedContacts.length, preferUrlFetch]);

  if (!fileUrl && cachedContacts.length === 0) {
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
              ? `${rows.length} contact(s) · ${displayName}${fromUrl ? " · from URL" : ""}`
              : displayName}
        </p>
      </div>

      {error ? (
        <p className="rounded-[6px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {loading && rows.length === 0 ? (
        <AppLoader variant="compact" label="Fetching contacts" />
      ) : rows.length > 0 ? (
        <div className="overflow-x-auto rounded-[6px] border border-border/50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-semibold">#</th>
                <th className="px-3 py-2 font-semibold">contact</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`contact-${index}`}
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
                  <td
                    className={cn(
                      "max-w-55 truncate px-3 font-mono tabular-nums",
                      compact ? "py-1.5" : "py-2.5"
                    )}
                    title={row.contact || undefined}
                  >
                    {row.contact || "—"}
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
