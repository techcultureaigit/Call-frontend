"use client";

import { cn } from "@/lib/utils";

const AVATAR_STYLES = [
  {
    bg: "from-rose-200 via-pink-100 to-orange-100",
    hair: "#5c3d2e",
    skin: "#fcd5b0",
    shirt: "#7c9cbf",
  },
  {
    bg: "from-violet-200 via-purple-100 to-fuchsia-100",
    hair: "#2d1b4e",
    skin: "#f5c9a8",
    shirt: "#6b9bd1",
  },
  {
    bg: "from-sky-200 via-blue-100 to-cyan-100",
    hair: "#3d2314",
    skin: "#f0c097",
    shirt: "#89a4c7",
  },
] as const;

interface AgentAvatarProps {
  seed: string;
  className?: string;
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function AgentAvatar({ seed, className }: AgentAvatarProps) {
  const style = AVATAR_STYLES[hashSeed(seed) % AVATAR_STYLES.length];

  return (
    <div
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-sm",
        `bg-gradient-to-br ${style.bg}`,
        className
      )}
    >
      <svg
        viewBox="0 0 64 64"
        className="size-full"
        aria-hidden
      >
        <ellipse cx="32" cy="58" rx="18" ry="10" fill={style.shirt} />
        <circle cx="32" cy="28" r="16" fill={style.skin} />
        <path
          d="M16 22 C18 8, 46 8, 48 22 C50 14, 44 4, 32 4 C20 4, 14 14, 16 22 Z"
          fill={style.hair}
        />
        <circle cx="26" cy="28" r="2" fill="#2d2d2d" />
        <circle cx="38" cy="28" r="2" fill="#2d2d2d" />
        <path
          d="M28 34 Q32 37 36 34"
          stroke="#c47a5a"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
