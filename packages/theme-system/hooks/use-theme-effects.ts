import * as React from "react"
import { fonts, resolveThemeFontFamily } from "@/packages/theme-system/fonts"
import { defaultThemeSettings, themePresets } from "../theme-presets"
import { updateThemeVariables } from "../theme-utils"
import { useResolvedTheme } from "./use-resolved-theme"
import { useThemeStore } from "./use-theme-store"

const fallbackFontFamily = resolveThemeFontFamily(defaultThemeSettings.fontFamily)

function buildThemeFingerprint(input: {
  presetKey: string
  mode: "light" | "dark"
  fontFamily: string
  borderRadius: number
}): string {
  return [input.presetKey, input.mode, input.fontFamily, String(input.borderRadius)].join("|")
}

/**
 * Theme effects hook - applies theme changes to DOM
 */
export function useThemeEffects() {
  const activePreset = useThemeStore((state) => state.activePreset)
  const fontFamily = useThemeStore((state) => state.fontFamily)
  const borderRadius = useThemeStore((state) => state.ui.borderRadius)
  const resolvedTheme = useResolvedTheme()

  React.useLayoutEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    const preset = themePresets.find((p) => p.key === activePreset)
    if (!preset) {
      return
    }

    const resolvedFontFamily = resolveThemeFontFamily(fontFamily, fallbackFontFamily)
    const root = document.documentElement
    const nextFingerprint = buildThemeFingerprint({
      presetKey: preset.key,
      mode: resolvedTheme,
      fontFamily: resolvedFontFamily,
      borderRadius,
    })

    if (root.dataset.themeFingerprint === nextFingerprint) {
      return
    }

    // Apply theme preset colors
    updateThemeVariables(preset, resolvedTheme)

    // Apply theme class
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
    root.dataset.theme = resolvedTheme
    root.dataset.themePreset = preset.key
    root.dataset.themeFingerprint = nextFingerprint

    // Apply border radius
    root.style.setProperty("--radius", `${borderRadius}px`)

    // Apply font family
    for (const font of fonts) {
      const fontClass = `font-${font.replace(/\s+/g, "-").toLowerCase()}`
      root.classList.remove(fontClass)
    }
    const currentFontClass = `font-${resolvedFontFamily.replace(/\s+/g, "-").toLowerCase()}`
    root.classList.add(currentFontClass)
    root.style.fontFamily = `var(--${currentFontClass})`
  }, [borderRadius, activePreset, fontFamily, resolvedTheme])
}
