import { cn } from "@/lib/utils";

const styles = {
  positive: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  neutral: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
  negative: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function SentimentBadge({
  sentiment,
  score,
  className,
}: {
  sentiment: "positive" | "neutral" | "negative";
  score?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize",
        styles[sentiment],
        className
      )}
    >
      {sentiment}
      {score !== undefined && (
        <span className="opacity-70">({Math.round(score * 100)}%)</span>
      )}
    </span>
  );
}
