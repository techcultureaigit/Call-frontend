"use client";

import {
  Building2,
  CreditCard,
  HeartPulse,
  Layers,
  MessageSquare,
  Phone,
  Shield,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  target: Target,
  building: Building2,
  shield: Shield,
  heart: HeartPulse,
  message: MessageSquare,
  credit: CreditCard,
  phone: Phone,
  layers: Layers,
};

export function TemplateIcon({
  name,
  className,
  accent,
}: {
  name: string;
  className?: string;
  accent?: string;
}) {
  const Icon = ICON_MAP[name] ?? Sparkles;

  return (
    <div
      className={cn(
        "flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-inner backdrop-blur-md",
        className
      )}
      style={
        accent
          ? {
              background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
              borderColor: `${accent}33`,
            }
          : undefined
      }
    >
      <Icon className="size-5 text-foreground/90" />
    </div>
  );
}
