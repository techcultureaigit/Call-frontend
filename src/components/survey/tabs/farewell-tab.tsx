"use client";

import { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DEFAULT_FAREWELL } from "@/lib/constants/agent-config";

interface FarewellTabProps {
  value: string;
  onChange: (farewell: string) => void;
}

export function FarewellTab({ value, onChange }: FarewellTabProps) {
  const didSeedDefault = useRef(false);

  useEffect(() => {
    if (didSeedDefault.current) return;
    didSeedDefault.current = true;
    if (!value?.trim()) {
      onChange(DEFAULT_FAREWELL);
    }
  }, [value, onChange]);

  const farewellLeft = 500 - (value?.length ?? 0);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Farewell</h2>
        <p className="text-sm text-muted-foreground">
          Closing message spoken at the end of the survey call.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="farewell">Agent Farewell</Label>
        <textarea
          id="farewell"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          maxLength={500}
          className="w-full rounded-[6px] border border-input bg-transparent px-3 py-2 text-sm shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={DEFAULT_FAREWELL}
        />
        <p
          className={cn(
            "text-xs",
            farewellLeft < 40 ? "text-amber-600" : "text-muted-foreground"
          )}
        >
          {farewellLeft} characters left
        </p>
      </div>
    </div>
  );
}
