import * as React from "react"
import { fonts } from "@/app/fonts"
import { themePresets } from "@/config/theme-presets"
import { useThemeStore } from "@/hooks/use-theme-store"
import { resolveThemeMode, updateThemeVariables } from "@/lib/theme-utils"

/**
 * Theme effects hook - applies theme changes to DOM
 */
export function useThemeEffects() {
	const mode = useThemeStore((state) => state.mode)
	const activePreset = useThemeStore((state) => state.activePreset)
	const fontFamily = useThemeStore((state) => state.fontFamily)
	const borderRadius = useThemeStore((state) => state.ui.borderRadius)

	React.useEffect(() => {
		if (typeof document === "undefined") {
			return
		}

		const root = document.documentElement

		// Apply theme class
		root.classList.remove("light", "dark")
		const effectiveMode = resolveThemeMode(mode)
		root.classList.add(effectiveMode)
		root.dataset.theme = effectiveMode

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
			updateThemeVariables(preset, effectiveMode)
		}
	}, [borderRadius, activePreset, mode, fontFamily])
}
