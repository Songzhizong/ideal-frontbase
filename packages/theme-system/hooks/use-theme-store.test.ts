import { beforeEach, describe, expect, it, vi } from "vitest"
import { defaultThemeSettings } from "../theme-presets"
import type { ThemeConfig } from "../types/theme"
import { initializeTheme, useThemeStore } from "./use-theme-store"

type MediaQueryListener = (event: MediaQueryListEvent) => void

function createMatchMediaMock(matches: boolean): (query: string) => MediaQueryList {
  return (query: string): MediaQueryList => {
    const listeners = new Set<MediaQueryListener>()
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        if (typeof listener === "function") {
          listeners.add(listener as MediaQueryListener)
        }
      },
      removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        if (typeof listener === "function") {
          listeners.delete(listener as MediaQueryListener)
        }
      },
      addListener: (listener: MediaQueryListener) => {
        listeners.add(listener)
      },
      removeListener: (listener: MediaQueryListener) => {
        listeners.delete(listener)
      },
      dispatchEvent: (event: Event) => {
        for (const listener of listeners) {
          listener(event as MediaQueryListEvent)
        }
        return true
      },
    } as MediaQueryList
  }
}

function cloneDefaultThemeConfig(): ThemeConfig {
  return {
    ...defaultThemeSettings,
    layout: { ...defaultThemeSettings.layout },
    ui: { ...defaultThemeSettings.ui },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function dispatchStorageEvent(
  key: string | null,
  newValue: string | null,
  oldValue: string | null,
): void {
  const event = new StorageEvent("storage", {
    key,
    newValue,
    oldValue,
  })
  window.dispatchEvent(event)
}

describe("initializeTheme storage sync", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", createMatchMediaMock(false))
    window.localStorage.clear()
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.removeAttribute("data-theme")
    root.removeAttribute("data-theme-preset")
    root.removeAttribute("data-theme-fingerprint")
    root.style.cssText = ""
    useThemeStore.setState(cloneDefaultThemeConfig())
    initializeTheme()
  })

  it("syncs theme state from storage events", () => {
    const newConfig = {
      mode: "dark",
      activePreset: "core-blue",
      fontFamily: "manrope",
      layout: {
        containerWidth: "full",
      },
      ui: {
        borderRadius: 12,
        pageAnimation: "fade",
      },
    }
    const newRaw = JSON.stringify({ state: newConfig })
    const oldRaw = window.localStorage.getItem("theme-config")
    window.localStorage.setItem("theme-config", newRaw)
    dispatchStorageEvent("theme-config", newRaw, oldRaw)

    const state = useThemeStore.getState()
    expect(state.mode).toBe("dark")
    expect(state.activePreset).toBe("core-blue")
    expect(state.fontFamily).toBe("manrope")
    expect(state.layout.containerWidth).toBe("full")
    expect(state.ui.borderRadius).toBe(12)
    expect(state.ui.pageAnimation).toBe("fade")

    const root = document.documentElement
    expect(root.dataset.theme).toBe("dark")
    expect(root.dataset.themePreset).toBe("core-blue")
    expect(root.classList.contains("dark")).toBe(true)

    const resolvedRaw = window.localStorage.getItem("theme-resolved")
    expect(resolvedRaw).not.toBeNull()
    const resolved = JSON.parse(resolvedRaw ?? "null") as unknown
    expect(isRecord(resolved)).toBe(true)
    if (!isRecord(resolved)) {
      return
    }

    expect(resolved.version).toBe(2)
    expect(isRecord(resolved.varsByMode)).toBe(true)
    if (!isRecord(resolved.varsByMode)) {
      return
    }

    const lightVars = resolved.varsByMode.light
    const darkVars = resolved.varsByMode.dark
    expect(isRecord(lightVars)).toBe(true)
    expect(isRecord(darkVars)).toBe(true)
    if (!isRecord(lightVars) || !isRecord(darkVars)) {
      return
    }

    expect(typeof lightVars["--background"]).toBe("string")
    expect(typeof darkVars["--background"]).toBe("string")
  })

  it("resets to default theme when config is removed", () => {
    const setDarkRaw = JSON.stringify({
      state: { mode: "dark", activePreset: "core-blue", fontFamily: "manrope" },
    })
    window.localStorage.setItem("theme-config", setDarkRaw)
    dispatchStorageEvent("theme-config", setDarkRaw, null)
    expect(useThemeStore.getState().mode).toBe("dark")

    const oldRaw = window.localStorage.getItem("theme-config")
    window.localStorage.removeItem("theme-config")
    dispatchStorageEvent("theme-config", null, oldRaw)

    const state = useThemeStore.getState()
    expect(state.mode).toBe(defaultThemeSettings.mode)
    expect(state.activePreset).toBe(defaultThemeSettings.activePreset)
    expect(state.fontFamily).toBe(defaultThemeSettings.fontFamily)

    const root = document.documentElement
    expect(root.dataset.theme).toBe("light")
    expect(root.classList.contains("light")).toBe(true)
  })

  it("ignores unrelated storage keys", () => {
    useThemeStore.getState().setMode("dark")
    const before = useThemeStore.getState().mode
    dispatchStorageEvent("unrelated-key", JSON.stringify({ value: true }), null)
    const after = useThemeStore.getState().mode
    expect(before).toBe("dark")
    expect(after).toBe("dark")
  })
})
