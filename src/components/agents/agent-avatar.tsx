"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const AGENT_AVATAR_OPTIONS = [
  {
    id: "aria",
    label: "Aria",
    bg: "from-rose-200 via-pink-100 to-orange-100",
    hair: "#5c3d2e",
    skin: "#fcd5b0",
    shirt: "#7c9cbf",
    accent: "#e8a0b0",
  },
  {
    id: "nova",
    label: "Nova",
    bg: "from-teal-200 via-cyan-100 to-sky-100",
    hair: "#1f3d3a",
    skin: "#f0c097",
    shirt: "#2a9d8f",
    accent: "#7dd3c0",
  },
  {
    id: "kai",
    label: "Kai",
    bg: "from-sky-200 via-blue-100 to-cyan-100",
    hair: "#3d2314",
    skin: "#e8b896",
    shirt: "#2983ad",
    accent: "#7eb8d4",
  },
  {
    id: "mira",
    label: "Mira",
    bg: "from-amber-200 via-yellow-100 to-orange-100",
    hair: "#4a2c0a",
    skin: "#f5c9a8",
    shirt: "#d97706",
    accent: "#f0c070",
  },
  {
    id: "leo",
    label: "Leo",
    bg: "from-slate-200 via-zinc-100 to-stone-100",
    hair: "#1c1917",
    skin: "#d4a574",
    shirt: "#475569",
    accent: "#94a3b8",
  },
] as const;

export type AgentAvatarId = (typeof AGENT_AVATAR_OPTIONS)[number]["id"];

interface AgentAvatarProps {
  seed?: string;
  avatarId?: string;
  className?: string;
  selected?: boolean;
  showCheck?: boolean;
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function resolveStyle(seed?: string, avatarId?: string) {
  if (avatarId) {
    const match = AGENT_AVATAR_OPTIONS.find((o) => o.id === avatarId);
    if (match) return match;
  }
  const styles = AGENT_AVATAR_OPTIONS;
  return styles[hashSeed(seed ?? "agent") % styles.length];
}

export function AgentAvatar({
  seed,
  avatarId,
  className,
  selected,
  showCheck,
}: AgentAvatarProps) {
  const style = resolveStyle(seed, avatarId);

  return (
    <div
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 shadow-sm",
        `bg-linear-to-br ${style.bg}`,
        selected ? "border-brand ring-2 ring-brand/30" : "border-white",
        className
      )}
    >
      <svg viewBox="0 0 64 64" className="size-full" aria-hidden>
        <defs>
          <radialGradient id={`glow-${style.id}`} cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="100%" stopColor={style.accent} stopOpacity="0.15" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill={`url(#glow-${style.id})`} />
        <ellipse cx="32" cy="58" rx="20" ry="12" fill={style.shirt} />
        <ellipse
          cx="32"
          cy="52"
          rx="14"
          ry="5"
          fill="white"
          opacity="0.18"
        />
        <circle cx="32" cy="27" r="15.5" fill={style.skin} />
        <path
          d="M17 22 C19 7, 45 7, 47 22 C49 13, 43 3, 32 3 C21 3, 15 13, 17 22 Z"
          fill={style.hair}
        />
        <ellipse cx="26" cy="27.5" rx="2.2" ry="2.4" fill="#2a2a2a" />
        <ellipse cx="38" cy="27.5" rx="2.2" ry="2.4" fill="#2a2a2a" />
        <circle cx="26.6" cy="26.8" r="0.7" fill="white" opacity="0.7" />
        <circle cx="38.6" cy="26.8" r="0.7" fill="white" opacity="0.7" />
        <path
          d="M28.5 34 Q32 37.5 35.5 34"
          stroke="#c47a5a"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      {showCheck && selected && (
        <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full brand-gradient text-brand-foreground ring-2 ring-card">
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      )}
    </div>
  );
}
