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
  const isBrowser = typeof window !== "undefined"

  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      if (!isBrowser) {
        return () => {}
      }
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      mediaQuery.addEventListener("change", onStoreChange)
      return () => mediaQuery.removeEventListener("change", onStoreChange)
    },
    [isBrowser],
  )

  const getSnapshot = React.useCallback((): ThemeMode => {
    if (!isBrowser) {
      return "light"
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }, [isBrowser])

  const systemTheme = React.useSyncExternalStore<ThemeMode>(subscribe, getSnapshot, () => "light")
  return mode === "system" ? systemTheme : resolveThemeMode(mode)
}
