import { create } from "zustand"
import { persist } from "zustand/middleware"
import { defaultThemeConfig, type ThemeConfig } from "@/app/theme-config"

type UiState = {
	sidebarOpen: boolean
	toggleSidebar: () => void
	setSidebarOpen: (open: boolean) => void

	// Theme & Layout Settings
	theme: ThemeConfig["theme"]
	setTheme: (theme: ThemeConfig["theme"]) => void

	menuLayout: ThemeConfig["menuLayout"]
	setMenuLayout: (layout: ThemeConfig["menuLayout"]) => void

	themeColors: ThemeConfig["themeColors"]
	setThemeColor: (key: keyof ThemeConfig["themeColors"], color: string) => void

	containerWidth: ThemeConfig["containerWidth"]
	setContainerWidth: (width: ThemeConfig["containerWidth"]) => void

	sidebarWidth: number
	setSidebarWidth: (width: number) => void

	sidebarCollapsedWidth: number
	setSidebarCollapsedWidth: (width: number) => void

	headerHeight: number
	setHeaderHeight: (height: number) => void

	showBreadcrumb: boolean
	setShowBreadcrumb: (show: boolean) => void

	showBreadcrumbIcon: boolean
	setShowBreadcrumbIcon: (show: boolean) => void

	pageAnimation: ThemeConfig["pageAnimation"]
	setPageAnimation: (animation: ThemeConfig["pageAnimation"]) => void

	borderRadius: number
	setBorderRadius: (radius: number) => void

	setThemeColors: (colors: ThemeConfig["themeColors"]) => void

	// Actions
	resetConfig: () => void
	getThemeConfig: () => ThemeConfig
}

export const useUiStore = create<UiState>()(
	persist(
		(set, get) => ({
			sidebarOpen: false,
			toggleSidebar: () => {
				set((state) => ({ sidebarOpen: !state.sidebarOpen }))
			},
			setSidebarOpen: (sidebarOpen) => {
				set({ sidebarOpen })
			},

			...defaultThemeConfig,

			setTheme: (theme) => set({ theme }),

			setMenuLayout: (menuLayout) => set({ menuLayout }),

			setThemeColor: (key, color) =>
				set((state) => ({
					themeColors: { ...state.themeColors, [key]: color },
				})),

			setContainerWidth: (containerWidth) => set({ containerWidth }),

			setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),

			setSidebarCollapsedWidth: (sidebarCollapsedWidth) => set({ sidebarCollapsedWidth }),

			setHeaderHeight: (headerHeight) => set({ headerHeight }),

			setShowBreadcrumb: (showBreadcrumb) => set({ showBreadcrumb }),

			setShowBreadcrumbIcon: (showBreadcrumbIcon) => set({ showBreadcrumbIcon }),

			setPageAnimation: (pageAnimation) => set({ pageAnimation }),

			setBorderRadius: (borderRadius) => set({ borderRadius }),

			setThemeColors: (themeColors) => set({ themeColors }),

			resetConfig: () => {
				set({ ...defaultThemeConfig })
			},

			getThemeConfig: () => {
				const {
					theme,
					menuLayout,
					themeColors,
					containerWidth,
					sidebarWidth,
					sidebarCollapsedWidth,
					headerHeight,
					showBreadcrumb,
					showBreadcrumbIcon,
					pageAnimation,
					borderRadius,
				} = get()
				return {
					theme,
					menuLayout,
					themeColors,
					containerWidth,
					sidebarWidth,
					sidebarCollapsedWidth,
					headerHeight,
					showBreadcrumb,
					showBreadcrumbIcon,
					pageAnimation,
					borderRadius,
				}
			},
		}),
		{
			name: "ui-storage",
			partialize: (state) => {
				const { sidebarOpen, ...rest } = state
				return rest
			},
		},
	),
)
