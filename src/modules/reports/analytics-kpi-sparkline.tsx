"use client";

import { cn } from "@/lib/utils";

export function AnalyticsKpiSparkline({
  data,
  className,
  strokeClassName = "stroke-brand",
  fillClassName = "fill-brand/20",
}: {
  data?: number[];
  className?: string;
  strokeClassName?: string;
  fillClassName?: string;
}) {
  if (!data?.length || data.every((v) => v === 0)) return null;

  const width = 120;
  const height = 32;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const coords = data.map((value, index) => {
    const x =
      data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return { x, y };
  });

  const line = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-8 w-full opacity-40",
        className
      )}
    >
      <polygon className={fillClassName} points={area} />
      <polyline
        className={cn("fill-none", strokeClassName)}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={line}
      />
    </svg>
  );
}
