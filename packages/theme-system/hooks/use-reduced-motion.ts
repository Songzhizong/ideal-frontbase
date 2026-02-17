import * as React from "react"

const reducedMotionQuery = "(prefers-reduced-motion: reduce)"

/**
 * Tracks system reduced-motion preference.
 */
export function useReducedMotion(): boolean {
  const isBrowser = typeof window !== "undefined"

  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      if (!isBrowser) {
        return () => {}
      }

      const mediaQuery = window.matchMedia(reducedMotionQuery)
      mediaQuery.addEventListener("change", onStoreChange)
      return () => mediaQuery.removeEventListener("change", onStoreChange)
    },
    [isBrowser],
  )

  const getSnapshot = React.useCallback((): boolean => {
    if (!isBrowser) {
      return false
    }

    return window.matchMedia(reducedMotionQuery).matches
  }, [isBrowser])

  return React.useSyncExternalStore(subscribe, getSnapshot, () => false)
}
