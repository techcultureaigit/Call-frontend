import type { ChartDataPoint } from "@/types/dashboard";

export type ChartGranularity = "daily" | "weekly" | "monthly";

function parseDayLabel(label: string): Date | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const d = new Date(`${label}T12:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(label);
  return Number.isNaN(d.getTime()) ? null : d;
}

function weekStartKey(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function formatBucketLabel(key: string, granularity: ChartGranularity): string {
  const d = parseDayLabel(key);
  if (!d) return key;

  if (granularity === "monthly") {
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  if (granularity === "weekly") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function aggregateCallsOverTime(
  data: ChartDataPoint[],
  granularity: ChartGranularity
): ChartDataPoint[] {
  if (!data.length || granularity === "daily") return data;

  const buckets = new Map<
    string,
    {
      calls: number;
      connected: number;
      disconnected: number;
      missed: number;
    }
  >();

  for (const row of data) {
    const raw = String(row.label || "");
    const date = parseDayLabel(raw);
    if (!date) continue;

    const key =
      granularity === "monthly"
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        : weekStartKey(date);

    const bucket = buckets.get(key) || {
      calls: 0,
      connected: 0,
      disconnected: 0,
      missed: 0,
    };

    bucket.calls += Number(row.calls ?? row.value ?? 0);
    bucket.connected += Number(row.connected ?? 0);
    bucket.disconnected += Number(row.disconnected ?? 0);
    bucket.missed += Number(row.missed ?? 0);
    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, row]) => ({
      label: formatBucketLabel(key, granularity),
      value: row.calls,
      calls: row.calls,
      connected: row.connected,
      disconnected: row.disconnected,
      missed: row.missed,
    }));
}
