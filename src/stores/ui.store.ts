import { create } from "zustand";

interface UIState {
  isCommandPaletteOpen: boolean;
  isGlobalSearchOpen: boolean;
  pageTitle: string | null;
  breadcrumbs: { label: string; href?: string }[];
}

interface UIActions {
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;
  setPageTitle: (title: string | null) => void;
  setBreadcrumbs: (items: { label: string; href?: string }[]) => void;
  resetPageMeta: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()((set) => ({
  isCommandPaletteOpen: false,
  isGlobalSearchOpen: false,
  pageTitle: null,
  breadcrumbs: [],

  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  toggleCommandPalette: () =>
    set((state) => ({
      isCommandPaletteOpen: !state.isCommandPaletteOpen,
    })),

  openGlobalSearch: () => set({ isGlobalSearchOpen: true }),
  closeGlobalSearch: () => set({ isGlobalSearchOpen: false }),

  setPageTitle: (title) => set({ pageTitle: title }),
  setBreadcrumbs: (items) => set({ breadcrumbs: items }),

  resetPageMeta: () =>
    set({
      pageTitle: null,
      breadcrumbs: [],
    }),
}));
