"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatRelativeTime } from "@/lib/utils";
import { SettingsSectionCard } from "../settings-section-card";
import type { AuditLogEntry } from "@/types/settings";

interface AuditSectionProps {
  values: AuditLogEntry[];
}

export function AuditSection({ values }: AuditSectionProps) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const sections = ["all", ...new Set(values.map((v) => v.section))];

  const filtered = values.filter((entry) => {
    const matchSection = filter === "all" || entry.section === filter;
    const matchSearch =
      !search.trim() ||
      entry.action.toLowerCase().includes(search.toLowerCase()) ||
      entry.user.toLowerCase().includes(search.toLowerCase());
    return matchSection && matchSearch;
  });

  return (
    <SettingsSectionCard
      title="Audit Log"
      description="Recent configuration changes"
      helpTooltip="Track all settings modifications with user attribution and timestamps."
      gradient="from-blue-500/10 to-transparent"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actions or users…"
          className="rounded-[6px]"
        />
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={sections.map((s) => ({
            label: s === "all" ? "All sections" : s,
            value: s,
          }))}
          className="rounded-[6px] sm:w-48"
        />
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-border/40">
        <table className="w-full min-w-[500px] text-sm">
          <thead className="border-b border-border/40 bg-muted/30">
            <tr>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                User
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Action
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Section
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No audit entries match your filter
                </td>
              </tr>
            ) : (
              filtered.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-border/20 transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-medium">{entry.user}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {entry.action}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
                      {entry.section}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {formatRelativeTime(entry.timestamp)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SettingsSectionCard>
  );
}
