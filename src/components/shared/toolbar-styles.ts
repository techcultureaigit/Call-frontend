/** Outline controls in list toolbars (Export, Columns, Reset, etc.). */
export const TOOLBAR_OUTLINE_CONTROL_CLASS =
  "h-9 shrink-0 gap-1 rounded-[6px] border-border/50 bg-background/80 px-2 text-xs font-medium shadow-subtle hover:border-primary/30 xl:h-10 xl:gap-1.5 xl:px-3 xl:text-sm";

/** Primary CTA in list toolbars (Create, Add, etc.). */
export const TOOLBAR_PRIMARY_BUTTON_CLASS =
  "h-9 shrink-0 rounded-[6px] px-3 text-xs shadow-brand xl:h-10 xl:px-5 xl:text-sm";

/** Secondary action buttons beside filters (Export, etc.). */
export const TOOLBAR_ACTION_BUTTON_CLASS = TOOLBAR_OUTLINE_CONTROL_CLASS;

/** Filter dropdowns — compact on small desktop, roomier on xl+. */
export const TOOLBAR_FILTER_SELECT_CLASS =
  "h-9 w-full shrink-0 rounded-[6px] border-border/50 bg-background/80 px-2.5 text-xs shadow-subtle md:w-28 lg:w-32 xl:h-10 xl:w-40 xl:px-3.5 xl:text-sm";

/**
 * Search field width — shares one row with filters from md up.
 * Full width only on mobile; flexes between filters on desktop.
 */
export const TOOLBAR_SEARCH_WIDTH_CLASS =
  "min-w-0 w-full basis-full md:basis-auto md:min-w-28 md:flex-1 md:max-w-40 lg:max-w-48 xl:max-w-md";

/** Search input — stays compact until xl screens. */
export const TOOLBAR_SEARCH_INPUT_CLASS =
  "h-9 w-full rounded-[6px] border-border/50 bg-background/80 pl-8 text-xs shadow-subtle xl:h-10 xl:pl-9 xl:text-sm";

/** Toolbar outer row — one line on md+ desktop. */
export const TOOLBAR_ROW_CLASS =
  "flex min-w-0 w-full flex-wrap items-center gap-1.5 md:flex-nowrap md:gap-2";

/** Filters + actions cluster (right side). */
export const TOOLBAR_CONTROLS_CLASS =
  "ml-auto flex min-w-0 shrink-0 flex-wrap items-center gap-1.5 md:flex-nowrap md:gap-2";
