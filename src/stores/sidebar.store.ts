import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storageKeys } from "@/lib/constants/storage-keys";

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  expandedGroups: Record<string, boolean>;
}

interface SidebarActions {
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobile: () => void;
  setMobileOpen: (open: boolean) => void;
  closeMobile: () => void;
  toggleGroup: (groupId: string) => void;
  setGroupExpanded: (groupId: string, expanded: boolean) => void;
  setExpandedGroups: (groups: Record<string, boolean>) => void;
}

type SidebarStore = SidebarState & SidebarActions;

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      expandedGroups: {},

      toggleCollapsed: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),

      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),

      toggleMobile: () =>
        set((state) => ({ isMobileOpen: !state.isMobileOpen })),

      setMobileOpen: (open) => set({ isMobileOpen: open }),

      closeMobile: () => set({ isMobileOpen: false }),

      toggleGroup: (groupId) =>
        set((state) => ({
          expandedGroups: {
            ...state.expandedGroups,
            [groupId]: !state.expandedGroups[groupId],
          },
        })),

      setGroupExpanded: (groupId, expanded) =>
        set((state) => ({
          expandedGroups: {
            ...state.expandedGroups,
            [groupId]: expanded,
          },
        })),

      setExpandedGroups: (groups) => set({ expandedGroups: groups }),
    }),
    {
      name: storageKeys.sidebarCollapsed,
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        // Don't persist open dropdowns — always start collapsed
      }),
    }
  )
);

export function selectIsGroupExpanded(
  expandedGroups: Record<string, boolean>,
  groupId: string,
  _activeGroupIds?: string[]
): boolean {
  // Only open when user explicitly expanded — closed by default
  return expandedGroups[groupId] === true;
}
