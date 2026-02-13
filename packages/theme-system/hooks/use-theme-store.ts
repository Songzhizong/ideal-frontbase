/**
 * Theme Store - Global theme state management
 */
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { defaultThemeSettings, themePresets } from "../theme-presets"
import { resolveThemeMode, updateThemeVariables } from "../theme-utils"
import type { ThemeConfig, ThemeMode, ThemePreset } from "../types/theme"

export interface ThemeStore extends ThemeConfig {
  // Actions
  setMode: (mode: "light" | "dark" | "system") => void
  setPreset: (presetKey: string) => void
  setFontFamily: (font: string) => void
  setMenuLayout: (layout: "single" | "dual") => void
  setContainerWidth: (width: "full" | "fixed") => void
  setSidebarWidth: (width: number) => void
  setSidebarCollapsedWidth: (width: number) => void
  setHeaderHeight: (height: number) => void
  setShowBreadcrumb: (show: boolean) => void
  setShowBreadcrumbIcon: (show: boolean) => void
  setSidebarAccordion: (enabled: boolean) => void
  setBorderRadius: (radius: number) => void
  setPageAnimation: (
    animation: "none" | "fade" | "slide-left" | "slide-bottom" | "slide-top",
  ) => void
  reset: () => void

  // Computed
  getActivePreset: () => ThemePreset | undefined
  getEffectiveMode: () => ThemeMode
}

const themeStorageKey = "theme-config"
const resolvedThemeKey = "theme-resolved"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getPersistedThemeConfig(): ThemeConfig | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(themeStorageKey)
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null
    const state = isRecord(parsed.state) ? parsed.state : parsed
    const next: ThemeConfig = {
      ...defaultThemeSettings,
      ...(isRecord(state) ? (state as Partial<ThemeConfig>) : {}),
      layout: {
        ...defaultThemeSettings.layout,
        ...(isRecord(state.layout) ? (state.layout as Partial<ThemeConfig["layout"]>) : {}),
      },
      ui: {
        ...defaultThemeSettings.ui,
        ...(isRecord(state.ui) ? (state.ui as Partial<ThemeConfig["ui"]>) : {}),
      },
    }
    if (next.mode !== "light" && next.mode !== "dark" && next.mode !== "system") {
      next.mode = defaultThemeSettings.mode
    }
    if (typeof next.activePreset !== "string" || next.activePreset.length === 0) {
      next.activePreset = defaultThemeSettings.activePreset
    }
    if (typeof next.fontFamily !== "string" || next.fontFamily.length === 0) {
      next.fontFamily = defaultThemeSettings.fontFamily
    }
    return next
  } catch {
    return null
  }
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      ...defaultThemeSettings,

      setMode: (mode) => {
        set({ mode })
        applyTheme(get())
      },

      setPreset: (presetKey) => {
        set({ activePreset: presetKey })
        applyTheme(get())
      },

      setFontFamily: (fontFamily) => set({ fontFamily }),

      setMenuLayout: (menuLayout) =>
        set((state) => ({
          layout: { ...state.layout, menuLayout },
        })),

      setContainerWidth: (containerWidth) =>
        set((state) => ({
          layout: { ...state.layout, containerWidth },
        })),

      setSidebarWidth: (sidebarWidth) =>
        set((state) => ({
          layout: { ...state.layout, sidebarWidth },
        })),

      setSidebarCollapsedWidth: (sidebarCollapsedWidth) =>
        set((state) => ({
          layout: { ...state.layout, sidebarCollapsedWidth },
        })),

      setHeaderHeight: (headerHeight) =>
        set((state) => ({
          layout: { ...state.layout, headerHeight },
        })),

      setShowBreadcrumb: (showBreadcrumb) =>
        set((state) => ({
          ui: { ...state.ui, showBreadcrumb },
        })),

      setShowBreadcrumbIcon: (showBreadcrumbIcon) =>
        set((state) => ({
          ui: { ...state.ui, showBreadcrumbIcon },
        })),

      setSidebarAccordion: (sidebarAccordion) =>
        set((state) => ({
          ui: { ...state.ui, sidebarAccordion },
        })),

      setBorderRadius: (borderRadius) =>
        set((state) => ({
          ui: { ...state.ui, borderRadius },
        })),

      setPageAnimation: (pageAnimation) =>
        set((state) => ({
          ui: { ...state.ui, pageAnimation },
        })),

      reset: () => {
        set({ ...defaultThemeSettings })
        applyTheme(defaultThemeSettings)
      },

      getActivePreset: () => {
        const { activePreset } = get()
        return themePresets.find((p) => p.key === activePreset)
      },

      getEffectiveMode: () => {
        const { mode } = get()
        return resolveThemeMode(mode)
      },
    }),
    {
      name: themeStorageKey,
      partialize: (state) => ({
        mode: state.mode,
        activePreset: state.activePreset,
        fontFamily: state.fontFamily,
        layout: state.layout,
        ui: state.ui,
      }),
    },
  ),
)

/**
 * Apply theme to DOM
 */
function applyTheme(config: ThemeConfig) {
  const preset = themePresets.find((p) => p.key === config.activePreset)
  if (!preset) return

  const effectiveMode = resolveThemeMode(config.mode)
  updateThemeVariables(preset, effectiveMode)

  // Apply class + CSS vars immediately to keep all regions in sync.
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(effectiveMode)
  root.dataset.theme = effectiveMode

  // Apply border radius and font family (handled by useThemeEffects if active, but good for initialization)
  root.style.setProperty("--radius", `${config.ui.borderRadius}px`)

  const currentFontClass = `font-${config.fontFamily.replace(/\s+/g, "-").toLowerCase()}`
  root.style.fontFamily = `var(--${currentFontClass})`

  if (typeof window !== "undefined") {
    const background = root.style.getPropertyValue("--background")
    if (background) {
      const payload = JSON.stringify({ mode: effectiveMode, background })
      window.localStorage.setItem(resolvedThemeKey, payload)
    }
  }
}

/**
 * Initialize theme on app load
 */
export function initializeTheme() {
  const persistedConfig = getPersistedThemeConfig()
  const config = persistedConfig ?? useThemeStore.getState()
  if (persistedConfig) {
    useThemeStore.setState(persistedConfig)
  }
  applyTheme(config)

  // Listen for system theme changes
  if (typeof window !== "undefined") {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", () => {
      const currentConfig = useThemeStore.getState()
      if (currentConfig.mode === "system") {
        applyTheme(currentConfig)
      }
    })
  }
}
