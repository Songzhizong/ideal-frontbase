import * as React from "react"
import { fonts } from "@/app/fonts"
import { themePresets } from "@/config/theme-presets"
import { useThemeStore } from "@/hooks/use-theme-store"

/**
 * Convert hex color to HSL format for CSS variables
 */
function hexToHSL(hex: string): string {
	// Remove # if present
	hex = hex.replace(/^#/, "")

	// Parse hex values
	const r = Number.parseInt(hex.substring(0, 2), 16) / 255
	const g = Number.parseInt(hex.substring(2, 4), 16) / 255
	const b = Number.parseInt(hex.substring(4, 6), 16) / 255

	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	let h = 0
	let s = 0
	const l = (max + min) / 2

	if (max !== min) {
		const d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6
				break
			case g:
				h = ((b - r) / d + 2) / 6
				break
			case b:
				h = ((r - g) / d + 4) / 6
				break
		}
	}

	return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

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

		// Apply theme preset colors
		const preset = themePresets.find((p) => p.key === activePreset)
		if (preset) {
			const scheme = isDark ? preset.schemes.dark : preset.schemes.light

			// Brand colors (hex format for custom usage)
			root.style.setProperty("--color-primary", scheme.brand.primary)
			root.style.setProperty(
				"--color-primary-hover",
				scheme.brand.primaryHover || scheme.brand.primary,
			)
			root.style.setProperty(
				"--color-primary-active",
				scheme.brand.primaryActive || scheme.brand.primary,
			)
			root.style.setProperty("--color-primary-bg", scheme.brand.primaryBg || scheme.brand.primary)

			// Functional colors
			root.style.setProperty("--color-success", scheme.functional.success)
			root.style.setProperty(
				"--color-success-bg",
				scheme.functional.successBg || scheme.functional.success,
			)
			root.style.setProperty("--color-warning", scheme.functional.warning)
			root.style.setProperty(
				"--color-warning-bg",
				scheme.functional.warningBg || scheme.functional.warning,
			)
			root.style.setProperty("--color-error", scheme.functional.error)
			root.style.setProperty(
				"--color-error-bg",
				scheme.functional.errorBg || scheme.functional.error,
			)
			root.style.setProperty("--color-info", scheme.functional.info)
			root.style.setProperty("--color-info-bg", scheme.functional.infoBg || scheme.functional.info)

			// Text colors
			root.style.setProperty("--color-text-primary", scheme.text.primary)
			root.style.setProperty("--color-text-secondary", scheme.text.secondary)
			root.style.setProperty("--color-text-tertiary", scheme.text.tertiary)
			root.style.setProperty("--color-text-inverse", scheme.text.inverse)
			root.style.setProperty("--color-text-link", scheme.text.link)
			root.style.setProperty("--color-text-link-hover", scheme.text.linkHover || scheme.text.link)

			// Background colors
			root.style.setProperty("--color-bg-canvas", scheme.background.canvas)
			root.style.setProperty("--color-bg-container", scheme.background.container)
			root.style.setProperty("--color-bg-elevated", scheme.background.elevated)
			root.style.setProperty("--color-bg-layout", scheme.background.layout)
			root.style.setProperty("--color-bg-hover", scheme.background.hover)
			root.style.setProperty("--color-bg-active", scheme.background.active)

			// Border colors
			root.style.setProperty("--color-border-base", scheme.border.base)
			root.style.setProperty("--color-border-strong", scheme.border.strong)
			root.style.setProperty("--color-border-subtle", scheme.border.subtle)

			// Shadows (if defined)
			if (scheme.shadow) {
				root.style.setProperty("--shadow-sm", scheme.shadow.sm)
				root.style.setProperty("--shadow-md", scheme.shadow.md)
				root.style.setProperty("--shadow-lg", scheme.shadow.lg)
			}

			// Apply to shadcn/ui HSL variables (for Tailwind classes like bg-primary)
			root.style.setProperty("--primary", hexToHSL(scheme.brand.primary))
			root.style.setProperty("--primary-foreground", hexToHSL(scheme.text.inverse))
			root.style.setProperty("--foreground", hexToHSL(scheme.text.primary))
			root.style.setProperty("--background", hexToHSL(scheme.background.container))
			root.style.setProperty("--muted", hexToHSL(scheme.background.hover))
			root.style.setProperty("--muted-foreground", hexToHSL(scheme.text.secondary))
			root.style.setProperty("--accent", hexToHSL(scheme.background.hover))
			root.style.setProperty("--accent-foreground", hexToHSL(scheme.text.primary))
			root.style.setProperty("--border", hexToHSL(scheme.border.base))
			root.style.setProperty("--input", hexToHSL(scheme.border.base))
			root.style.setProperty("--card", hexToHSL(scheme.background.container))
			root.style.setProperty("--card-foreground", hexToHSL(scheme.text.primary))
			root.style.setProperty("--popover", hexToHSL(scheme.background.elevated))
			root.style.setProperty("--popover-foreground", hexToHSL(scheme.text.primary))

			// Sidebar variables
			root.style.setProperty("--sidebar-background", hexToHSL(scheme.background.layout))
			root.style.setProperty("--sidebar-foreground", hexToHSL(scheme.text.secondary))
			root.style.setProperty("--sidebar-primary", hexToHSL(scheme.brand.primary))
			root.style.setProperty("--sidebar-primary-foreground", hexToHSL(scheme.text.inverse))
			root.style.setProperty("--sidebar-accent", hexToHSL(scheme.background.hover))
			root.style.setProperty("--sidebar-accent-foreground", hexToHSL(scheme.text.primary))
			root.style.setProperty("--sidebar-border", hexToHSL(scheme.border.subtle))

			// Ring colors for focus states (hex format)
			root.style.setProperty("--ring", scheme.brand.primary)
			root.style.setProperty("--color-ring", scheme.brand.primary)
			root.style.setProperty("--sidebar-ring", scheme.brand.primary)
			root.style.setProperty("--color-sidebar-ring", scheme.brand.primary)

			// Additional color mappings for Tailwind
			root.style.setProperty("--color-primary-foreground", scheme.text.inverse)
			root.style.setProperty("--color-sidebar-primary-foreground", scheme.text.inverse)
		}

		// Force repaint
		root.style.display = "none"
		void root.offsetHeight
		root.style.display = ""
	}, [borderRadius, activePreset, mode, fontFamily])
}
