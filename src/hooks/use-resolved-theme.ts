import * as React from "react"
import { useThemeStore } from "@/hooks/use-theme-store"
import { resolveThemeMode } from "@/lib/theme-utils"
import type { ThemeMode } from "@/types/theme"

/**
 * Hook to track the resolved theme reactively (light or dark)
 * Handles "system" mode by listening to system preference changes
 */
export function useResolvedTheme(): ThemeMode {
	const mode = useThemeStore((state) => state.mode)
	const [resolvedTheme, setResolvedTheme] = React.useState<ThemeMode>(() => resolveThemeMode(mode))

	React.useEffect(() => {
		// Update immediately when mode changes
		setResolvedTheme(resolveThemeMode(mode))

		if (mode !== "system") return

		if (typeof window === "undefined") return

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
		const handleChange = () => {
			setResolvedTheme(resolveThemeMode("system"))
		}

		mediaQuery.addEventListener("change", handleChange)
		return () => mediaQuery.removeEventListener("change", handleChange)
	}, [mode])

	return resolvedTheme
}
