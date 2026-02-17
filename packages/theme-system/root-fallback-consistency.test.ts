import { describe, expect, it } from "vitest"

import { defaultThemeSettings, themePresets } from "./theme-presets"
import { flattenColorPalette } from "./theme-utils"
import { themeRootFallbacks } from "./tokens/generated/theme-root-fallbacks.generated"

describe("root fallback consistency", () => {
  it("keeps root fallback values aligned with default preset overlap tokens", () => {
    const defaultPreset =
      themePresets.find((preset) => preset.key === defaultThemeSettings.activePreset) ??
      themePresets[0]
    if (!defaultPreset) {
      throw new Error("No default theme preset found.")
    }

    const vars = flattenColorPalette(defaultPreset.schemes.light, {
      includeRuntimeFallback: false,
    })
    const mismatches = Object.entries(themeRootFallbacks).flatMap(([cssVar, fallbackValue]) => {
      if (!Object.hasOwn(vars, cssVar)) {
        return []
      }

      const runtimeValue = vars[cssVar]
      if (runtimeValue === fallbackValue) {
        return []
      }

      return [
        {
          cssVar,
          fallbackValue,
          runtimeValue,
        },
      ]
    })

    expect(mismatches).toEqual([])
  })
})
