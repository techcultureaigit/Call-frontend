/**
 * Site-wide icon accent palette — matches sidebar (blue + violet primary).
 */
export const ICON_PALETTE = {
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    soft: "bg-blue-500/8 text-blue-400",
  },
  violet: {
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    soft: "bg-violet-500/8 text-violet-400",
  },
  sky: {
    text: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
    soft: "bg-sky-500/8 text-sky-400",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    soft: "bg-emerald-500/8 text-emerald-400",
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    soft: "bg-amber-500/8 text-amber-400",
  },
  rose: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/25",
    soft: "bg-rose-500/8 text-rose-400",
  },
  slate: {
    text: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/25",
    soft: "bg-slate-500/8 text-slate-400",
  },
} as const;

export type IconPaletteKey = keyof typeof ICON_PALETTE;

/** Sidebar nav item id → icon text color */
export const NAV_ICON_COLORS: Record<string, string> = {
  dashboard: ICON_PALETTE.sky.text,
  survey: ICON_PALETTE.blue.text,
  "surveys-main": ICON_PALETTE.blue.text,
  "library-voices": ICON_PALETTE.violet.text,
  "library-providers": ICON_PALETTE.sky.text,
  reports: ICON_PALETTE.violet.text,
  users: ICON_PALETTE.emerald.text,
  roles: ICON_PALETTE.amber.text,
  notifications: ICON_PALETTE.rose.text,
  "activity-logs": ICON_PALETTE.amber.text,
  settings: ICON_PALETTE.slate.text,
};

/** Card / module header icon backgrounds */
export const CARD_ICON_ACCENTS: Record<string, string> = {
  brand: `${ICON_PALETTE.blue.bg} ${ICON_PALETTE.blue.text}`,
  blue: `${ICON_PALETTE.blue.bg} ${ICON_PALETTE.blue.text}`,
  violet: `${ICON_PALETTE.violet.bg} ${ICON_PALETTE.violet.text}`,
  teal: `${ICON_PALETTE.blue.bg} ${ICON_PALETTE.blue.text}`,
  sky: `${ICON_PALETTE.sky.bg} ${ICON_PALETTE.sky.text}`,
  emerald: `${ICON_PALETTE.emerald.bg} ${ICON_PALETTE.emerald.text}`,
  amber: `${ICON_PALETTE.amber.bg} ${ICON_PALETTE.amber.text}`,
  rose: `${ICON_PALETTE.rose.bg} ${ICON_PALETTE.rose.text}`,
};

export function navIconColor(_itemId?: string, isActive?: boolean) {
  if (isActive) return "text-white";
  return "text-[#9aa5b8]";
}
