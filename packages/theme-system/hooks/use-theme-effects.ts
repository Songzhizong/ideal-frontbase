import * as React from "react"
import { fonts } from "@/packages/theme-system/fonts"
import { themePresets } from "../theme-presets"
import { updateThemeVariables } from "../theme-utils"
import { useResolvedTheme } from "./use-resolved-theme"
import { useThemeStore } from "./use-theme-store"

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

    const root = document.documentElement

    // Apply theme class
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
    root.dataset.theme = resolvedTheme

    // Apply border radius
    root.style.setProperty("--radius", `${borderRadius}px`)

    // Apply font family
    for (const font of fonts) {
      const fontClass = `font-${font.replace(/\s+/g, "-").toLowerCase()}`
      root.classList.remove(fontClass)
    }
    const currentFontClass = `font-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`
    root.classList.add(currentFontClass)
    root.style.fontFamily = `var(--${currentFontClass})`

    // Apply theme preset colors
    const preset = themePresets.find((p) => p.key === activePreset)
    if (preset) {
      updateThemeVariables(preset, resolvedTheme)
    }
  }, [borderRadius, activePreset, fontFamily, resolvedTheme])
}
