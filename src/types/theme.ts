/**
 * Design Token System - Type Definitions
 * Semantic color palette with granular control for light/dark modes
 */

export interface ColorPalette {
	// Brand Colors
	brand: {
		primary: string
		primaryHover?: string
		primaryActive?: string
		primaryBg?: string // Light background tint
	}

	// Functional Colors
	functional: {
		success: string
		successBg?: string
		warning: string
		warningBg?: string
		error: string
		errorBg?: string
		info: string
		infoBg?: string
	}

	// Typography
	text: {
		primary: string // Main text
		secondary: string // Secondary text
		tertiary: string // Disabled/placeholder
		inverse: string // Text on colored backgrounds
		link: string // Link color
		linkHover?: string
	}

	// Backgrounds
	background: {
		canvas: string // App background
		container: string // Card/panel background
		elevated: string // Dropdown/modal background
		layout: string // Sidebar/header background
		hover: string // Hover state background
		active: string // Active/selected state
	}

	// Borders
	border: {
		base: string // Default border
		strong: string // Emphasized border
		subtle: string // Divider/separator
	}

	// Shadows (optional)
	shadow?: {
		sm: string
		md: string
		lg: string
	}
}

export interface ThemeSchemes {
	light: ColorPalette
	dark: ColorPalette
}

export interface ThemePreset {
	key: string
	name: string
	description?: string
	schemes: ThemeSchemes
}

export interface ThemeConfig {
	// Active theme mode
	mode: "light" | "dark" | "system"

	// Active preset key
	activePreset: string

	// Typography
	fontFamily: string

	// Layout
	layout: {
		menuLayout: "single" | "dual"
		containerWidth: "full" | "fixed"
		sidebarWidth: number
		sidebarCollapsedWidth: number
		headerHeight: number
	}

	// UI Preferences
	ui: {
		showBreadcrumb: boolean
		showBreadcrumbIcon: boolean
		pageAnimation: "none" | "fade" | "slide-left" | "slide-bottom" | "slide-top"
		borderRadius: number
	}
}

export type ThemeMode = "light" | "dark"
