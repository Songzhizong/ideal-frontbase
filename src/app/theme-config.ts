export interface ThemeConfig {
	theme: "light" | "dark" | "system"
	menuLayout: "single" | "dual"
	themeColors: {
		primary: string
		success: string
		warning: string
		error: string
	}
	containerWidth: "full" | "fixed"
	sidebarWidth: number
	sidebarCollapsedWidth: number
	headerHeight: number
	showBreadcrumb: boolean
	showBreadcrumbIcon: boolean
	pageAnimation: "none" | "fade" | "slide-left" | "slide-bottom" | "slide-top"
	borderRadius: number
}

export const defaultThemeConfig: ThemeConfig = {
	theme: "system",
	menuLayout: "single",
	themeColors: {
		primary: "#0f172a",
		success: "#10b981",
		warning: "#f59e0b",
		error: "#ef4444",
	},
	containerWidth: "full",
	sidebarWidth: 240,
	sidebarCollapsedWidth: 74,
	headerHeight: 64,
	showBreadcrumb: true,
	showBreadcrumbIcon: true,
	pageAnimation: "fade",
	borderRadius: 10,
}

export const presetColors = [
	{
		name: "默认",
		colors: {
			primary: "#0f172a",
			success: "#10b981",
			warning: "#f59e0b",
			error: "#ef4444",
		},
	},
	{
		name: "极客蓝",
		colors: {
			primary: "#1d4ed8",
			success: "#10b981",
			warning: "#f59e0b",
			error: "#ef4444",
		},
	},
	{
		name: "薄荷绿",
		colors: {
			primary: "#059669",
			success: "#10b981",
			warning: "#f59e0b",
			error: "#ef4444",
		},
	},
	{
		name: "胭脂红",
		colors: {
			primary: "#be123c",
			success: "#10b981",
			warning: "#f59e0b",
			error: "#ef4444",
		},
	},
	{
		name: "日落橙",
		colors: {
			primary: "#ea580c",
			success: "#10b981",
			warning: "#f59e0b",
			error: "#ef4444",
		},
	},
	{
		name: "紫罗兰",
		colors: {
			primary: "#7c3aed",
			success: "#10b981",
			warning: "#f59e0b",
			error: "#ef4444",
		},
	},
]
