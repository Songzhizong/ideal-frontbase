/**
 * Theme Store - Global theme state management
 */
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { fonts, resolveThemeFontFamily } from "../fonts"
import { defaultThemeSettings, themePresets } from "../theme-presets"
import { flattenColorPalette, resolveThemeMode, updateThemeVariables } from "../theme-utils"
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
let themeRuntimeListenersInitialized = false
const presetKeySet = new Set(themePresets.map((preset) => preset.key))
const fallbackFontFamily = resolveThemeFontFamily(defaultThemeSettings.fontFamily)
const fallbackPresetKey = presetKeySet.has(defaultThemeSettings.activePreset)
  ? defaultThemeSettings.activePreset
  : (themePresets[0]?.key ?? "")

interface ResolvedThemeSnapshotPayload {
  version: 2
  presetKey: string
  mode: ThemeMode
  varsByMode: Record<ThemeMode, Record<string, string>>
}

function buildThemeFingerprint(input: {
  presetKey: string
  mode: ThemeMode
  fontFamily: string
  borderRadius: number
}): string {
  return [input.presetKey, input.mode, input.fontFamily, String(input.borderRadius)].join("|")
}

function resolvePresetKey(presetKey: string | undefined): string {
  if (typeof presetKey === "string" && presetKeySet.has(presetKey)) {
    return presetKey
  }

  return fallbackPresetKey
}

function resolveThemePreset(presetKey: string | undefined): ThemePreset | undefined {
  const key = resolvePresetKey(presetKey)
  return themePresets.find((preset) => preset.key === key)
}

function buildResolvedThemeSnapshot(
  preset: ThemePreset,
  mode: ThemeMode,
  cssVars: Readonly<Record<string, string>>,
): ResolvedThemeSnapshotPayload {
  const varsByMode: Record<ThemeMode, Record<string, string>> = {
    light: mode === "light" ? { ...cssVars } : flattenColorPalette(preset.schemes.light),
    dark: mode === "dark" ? { ...cssVars } : flattenColorPalette(preset.schemes.dark),
  }

  return {
    version: 2,
    presetKey: preset.key,
    mode,
    varsByMode,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parsePersistedThemeConfig(raw: string | null): ThemeConfig | null {
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
    next.activePreset = resolvePresetKey(next.activePreset)
    next.fontFamily = resolveThemeFontFamily(next.fontFamily, fallbackFontFamily)
    return next
  } catch {
    return null
  }
}

function getPersistedThemeConfig(): ThemeConfig | null {
  if (typeof window === "undefined") return null
  return parsePersistedThemeConfig(window.localStorage.getItem(themeStorageKey))
}

function syncThemeFromStorage(newValue: string | null): void {
  const parsedConfig = parsePersistedThemeConfig(newValue)
  const nextConfig = parsedConfig ?? defaultThemeSettings
  useThemeStore.setState(nextConfig)
  applyTheme(nextConfig)
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
        set({ activePreset: resolvePresetKey(presetKey) })
        applyTheme(get())
      },

      setFontFamily: (fontFamily) => {
        set({
          fontFamily: resolveThemeFontFamily(fontFamily, fallbackFontFamily),
        })
        applyTheme(get())
      },

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

      setBorderRadius: (borderRadius) => {
        set((state) => ({
          ui: { ...state.ui, borderRadius },
        }))
        applyTheme(get())
      },

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
  if (typeof document === "undefined") {
    return
  }

  const preset = resolveThemePreset(config.activePreset)
  if (!preset) return

  const effectiveMode = resolveThemeMode(config.mode)
  const resolvedFont = resolveThemeFontFamily(config.fontFamily, fallbackFontFamily)
  const root = document.documentElement
  const nextFingerprint = buildThemeFingerprint({
    presetKey: preset.key,
    mode: effectiveMode,
    fontFamily: resolvedFont,
    borderRadius: config.ui.borderRadius,
  })

  if (root.dataset.themeFingerprint === nextFingerprint) {
    return
  }

  // Apply class + CSS vars immediately to keep all regions in sync.
  const cssVars = updateThemeVariables(preset, effectiveMode)
  root.classList.remove("light", "dark")
  root.classList.add(effectiveMode)
  root.dataset.theme = effectiveMode
  root.dataset.themePreset = preset.key
  root.dataset.themeFingerprint = nextFingerprint

  // Apply border radius and font family.
  root.style.setProperty("--radius", `${config.ui.borderRadius}px`)

  for (const font of fonts) {
    const fontClass = `font-${font.replace(/\s+/g, "-").toLowerCase()}`
    root.classList.remove(fontClass)
  }
  const currentFontClass = `font-${resolvedFont.replace(/\s+/g, "-").toLowerCase()}`
  root.classList.add(currentFontClass)
  root.style.fontFamily = `var(--${currentFontClass})`

  if (typeof window !== "undefined") {
    const payload = buildResolvedThemeSnapshot(preset, effectiveMode, cssVars)
    window.localStorage.setItem(resolvedThemeKey, JSON.stringify(payload))
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

  if (typeof window === "undefined" || themeRuntimeListenersInitialized) {
    return
  }

  // Listen for system theme and cross-tab theme storage changes.
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  mediaQuery.addEventListener("change", () => {
    const currentConfig = useThemeStore.getState()
    if (currentConfig.mode === "system") {
      applyTheme(currentConfig)
    }
  })

  window.addEventListener("storage", (event) => {
    if (event.storageArea && event.storageArea !== window.localStorage) {
      return
    }

    if (event.key === themeStorageKey) {
      syncThemeFromStorage(event.newValue)
      return
    }

    if (event.key === null) {
      const raw = window.localStorage.getItem(themeStorageKey)
      syncThemeFromStorage(raw)
      return
    }
  })

  themeRuntimeListenersInitialized = true
}
