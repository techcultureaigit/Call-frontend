"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCallDuration } from "@/lib/constants/calls";
import { cn } from "@/lib/utils";

interface RecordingPlayerProps {
  durationSeconds: number;
  className?: string;
}

export function RecordingPlayer({
  durationSeconds,
  className,
}: RecordingPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= durationSeconds) {
            setPlaying(false);
            return durationSeconds;
          }
          return p + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, durationSeconds]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setProgress(Math.floor(ratio * durationSeconds));
  };

  const pct = durationSeconds > 0 ? (progress / durationSeconds) * 100 : 0;

  return (
    <div
      className={cn(
        "rounded-[6px] border border-border/60 bg-muted/20 p-4",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-1">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full transition-colors",
              i / 40 < pct / 100 ? "bg-primary" : "bg-muted-foreground/20"
            )}
            style={{
              height: `${12 + Math.sin(i * 0.8) * 8 + ((i * 7) % 5)}px`,
            }}
          />
        ))}
      </div>

      <div
        className="group mb-3 h-1.5 cursor-pointer overflow-hidden rounded-full bg-muted"
        onClick={handleSeek}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            className="size-9 rounded-full"
            onClick={() => {
              if (progress >= durationSeconds) setProgress(0);
              setPlaying(!playing);
            }}
          >
            {playing ? (
              <Pause className="size-4" />
            ) : (
              <Play className="ml-0.5 size-4" />
            )}
          </Button>
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatCallDuration(progress)} / {formatCallDuration(durationSeconds)}
          </span>
        </div>
        <Volume2 className="size-4 text-muted-foreground" />
      </div>
    </div>
  );
}
