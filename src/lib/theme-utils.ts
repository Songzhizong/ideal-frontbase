/**
 * Design Token System - Core Utilities
 * Handles CSS variable generation and color manipulation
 */

import type { ColorPalette, ThemeMode, ThemePreset } from "@/types/theme"

/**
 * Generate color variants (hover, active) from base color
 * Uses simple HSL manipulation for lighter/darker shades
 */
export function generateColorVariants(baseColor: string): {
	hover: string
	active: string
	bg: string
} {
	// Parse hex to RGB
	const hex = baseColor.replace("#", "")
	const r = Number.parseInt(hex.substring(0, 2), 16)
	const g = Number.parseInt(hex.substring(2, 4), 16)
	const b = Number.parseInt(hex.substring(4, 6), 16)

	// Convert to HSL
	const rNorm = r / 255
	const gNorm = g / 255
	const bNorm = b / 255

	const max = Math.max(rNorm, gNorm, bNorm)
	const min = Math.min(rNorm, gNorm, bNorm)
	let h = 0
	let s = 0
	const l = (max + min) / 2

	if (max !== min) {
		const d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

		switch (max) {
			case rNorm:
				h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6
				break
			case gNorm:
				h = ((bNorm - rNorm) / d + 2) / 6
				break
			case bNorm:
				h = ((rNorm - gNorm) / d + 4) / 6
				break
		}
	}

	// Generate variants
	const hoverL = Math.max(0, Math.min(1, l - 0.08)) // 8% darker
	const activeL = Math.max(0, Math.min(1, l - 0.12)) // 12% darker
	const bgL = Math.max(0, Math.min(1, l + 0.4)) // Much lighter for backgrounds

	return {
		hover: hslToHex(h, s, hoverL),
		active: hslToHex(h, s, activeL),
		bg: hslToHex(h, s, bgL),
	}
}

/**
 * Convert HSL to Hex
 */
function hslToHex(h: number, s: number, l: number): string {
	const hueToRgb = (p: number, q: number, t: number) => {
		if (t < 0) t += 1
		if (t > 1) t -= 1
		if (t < 1 / 6) return p + (q - p) * 6 * t
		if (t < 1 / 2) return q
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
		return p
	}

	const q = l < 0.5 ? l * (1 + s) : l + s - l * s
	const p = 2 * l - q

	const r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255)
	const g = Math.round(hueToRgb(p, q, h) * 255)
	const b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255)

	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * Flatten color palette to CSS variable map
 */
export function flattenColorPalette(palette: ColorPalette): Record<string, string> {
	const vars: Record<string, string> = {}

	// Brand colors
	vars["--color-primary"] = palette.brand.primary
	vars["--color-primary-hover"] =
		palette.brand.primaryHover || generateColorVariants(palette.brand.primary).hover
	vars["--color-primary-active"] =
		palette.brand.primaryActive || generateColorVariants(palette.brand.primary).active
	vars["--color-primary-bg"] =
		palette.brand.primaryBg || generateColorVariants(palette.brand.primary).bg

	// Functional colors
	vars["--color-success"] = palette.functional.success
	vars["--color-success-bg"] =
		palette.functional.successBg || generateColorVariants(palette.functional.success).bg
	vars["--color-warning"] = palette.functional.warning
	vars["--color-warning-bg"] =
		palette.functional.warningBg || generateColorVariants(palette.functional.warning).bg
	vars["--color-error"] = palette.functional.error
	vars["--color-error-bg"] =
		palette.functional.errorBg || generateColorVariants(palette.functional.error).bg
	vars["--color-info"] = palette.functional.info
	vars["--color-info-bg"] =
		palette.functional.infoBg || generateColorVariants(palette.functional.info).bg

	// Typography
	vars["--color-text-primary"] = palette.text.primary
	vars["--color-text-secondary"] = palette.text.secondary
	vars["--color-text-tertiary"] = palette.text.tertiary
	vars["--color-text-inverse"] = palette.text.inverse
	vars["--color-text-link"] = palette.text.link
	vars["--color-text-link-hover"] = palette.text.linkHover || palette.text.link

	// Backgrounds
	vars["--color-bg-canvas"] = palette.background.canvas
	vars["--color-bg-container"] = palette.background.container
	vars["--color-bg-elevated"] = palette.background.elevated
	vars["--color-bg-layout"] = palette.background.layout
	vars["--color-bg-hover"] = palette.background.hover
	vars["--color-bg-active"] = palette.background.active

	// Borders
	vars["--color-border-base"] = palette.border.base
	vars["--color-border-strong"] = palette.border.strong
	vars["--color-border-subtle"] = palette.border.subtle

	// Shadows (if provided)
	if (palette.shadow) {
		vars["--shadow-sm"] = palette.shadow.sm
		vars["--shadow-md"] = palette.shadow.md
		vars["--shadow-lg"] = palette.shadow.lg
	}

	return vars
}

/**
 * Apply theme to DOM by injecting CSS variables
 */
export function updateThemeVariables(preset: ThemePreset, mode: ThemeMode): void {
	const palette = preset.schemes[mode]
	const cssVars = flattenColorPalette(palette)

	const root = document.documentElement

	// Apply all CSS variables
	for (const [key, value] of Object.entries(cssVars)) {
		root.style.setProperty(key, value)
	}

	// Update data attribute for mode-specific styling
	root.setAttribute("data-theme", mode)
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): ThemeMode {
	if (typeof window === "undefined") return "light"
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/**
 * Resolve effective theme mode (handles "system" option)
 */
export function resolveThemeMode(configMode: "light" | "dark" | "system"): ThemeMode {
	if (configMode === "system") {
		return getSystemTheme()
	}
	return configMode
}
