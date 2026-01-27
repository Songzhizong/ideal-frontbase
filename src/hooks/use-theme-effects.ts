import * as React from "react"
import { fonts } from "@/app/fonts"
import { themePresets } from "@/config/theme-presets"
import { useThemeStore } from "@/hooks/use-theme-store"

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
		const isDark =
			mode === "dark" ||
			(mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
		const effectiveTheme = mode === "system" ? (isDark ? "dark" : "light") : mode
		root.classList.add(effectiveTheme)
		root.dataset.theme = effectiveTheme

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

		// Get colors from preset for legacy CSS variables
		const preset = themePresets.find((p) => p.key === activePreset)
		if (preset) {
			const scheme = isDark ? preset.schemes.dark : preset.schemes.light
			const primaryColor = scheme.brand.primary

			// Set legacy CSS variables for backward compatibility
			root.style.setProperty("--color-primary", primaryColor)
			root.style.setProperty("--color-success", scheme.functional.success)
			root.style.setProperty("--color-warning", scheme.functional.warning)
			root.style.setProperty("--color-error", scheme.functional.error)

			// Set ring colors
			root.style.setProperty("--ring", primaryColor)
			root.style.setProperty("--color-ring", primaryColor)
			root.style.setProperty("--sidebar-ring", primaryColor)
			root.style.setProperty("--color-sidebar-ring", primaryColor)

			// Set foreground colors
			if (isDark) {
				root.style.setProperty("--primary-foreground", "0 0% 100%")
				root.style.setProperty("--sidebar-primary-foreground", "0 0% 100%")
				root.style.setProperty("--color-primary-foreground", "white")
				root.style.setProperty("--color-sidebar-primary-foreground", "white")
			} else {
				root.style.setProperty("--primary-foreground", "0 0% 98%")
				root.style.setProperty("--sidebar-primary-foreground", "0 0% 98%")
				root.style.setProperty("--color-primary-foreground", "white")
				root.style.setProperty("--color-sidebar-primary-foreground", "white")
			}
		}

		// Force repaint
		root.style.display = "none"
		void root.offsetHeight
		root.style.display = ""
	}, [borderRadius, activePreset, mode, fontFamily])
}
