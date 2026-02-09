/**
 * UI Store - Sidebar state only
 * Theme configuration moved to use-theme-store.ts
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

type UiState = {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },
      setSidebarOpen: (sidebarOpen) => {
        set({ sidebarOpen })
      },
    }),
    {
      name: "ui-storage",
    },
  ),
)
