import { describe, expect, it } from "vitest"

import { themePresets } from "./theme-presets"
import { flattenColorPalette } from "./theme-utils"
import { themeSourceCssVariables } from "./tokens/generated/theme-token-mappings.generated"

const externallyManagedThemeSourceVars = new Set<`--${string}`>(["--font-sans", "--radius"])
const expectedExternallyManagedThemeSourceVars = ["--font-sans", "--radius"]
const samplePreset = themePresets.find((preset) => preset.key === "core-blue") ?? themePresets[0]

function getMissingRuntimeSourceVars(vars: Record<string, string>): string[] {
  return themeSourceCssVariables.filter((cssVar) => {
    if (externallyManagedThemeSourceVars.has(cssVar)) {
      return false
    }
    return !Object.hasOwn(vars, cssVar)
  })
}

function getUnmanagedSourceVars(vars: Record<string, string>): string[] {
  return themeSourceCssVariables.filter((cssVar) => !Object.hasOwn(vars, cssVar))
}

describe("flattenColorPalette", () => {
  it("covers all runtime-managed source css variables in every preset scheme", () => {
    const missingByScheme: string[] = []

    for (const preset of themePresets) {
      for (const mode of ["light", "dark"] as const) {
        const vars = flattenColorPalette(preset.schemes[mode], {
          includeRuntimeFallback: false,
        })
        const missing = getMissingRuntimeSourceVars(vars)
        if (missing.length > 0) {
          missingByScheme.push(`${preset.key}:${mode} => ${missing.join(", ")}`)
        }
      }
    }

    expect(missingByScheme).toEqual([])
  })

  it("keeps only font and radius tokens as externally managed source vars", () => {
    if (!samplePreset) {
      throw new Error("No theme preset found.")
    }
    const vars = flattenColorPalette(samplePreset.schemes.light)
    const unmanaged = getUnmanagedSourceVars(vars).sort()

    expect(unmanaged).toEqual([...expectedExternallyManagedThemeSourceVars].sort())
  })

  it("exposes gradient, material and 12 categorical chart tokens", () => {
    if (!samplePreset) {
      throw new Error("No theme preset found.")
    }
    const vars = flattenColorPalette(samplePreset.schemes.light)

    expect(vars["--gradient-brand"]).toMatch(/^linear-gradient\(/)
    expect(vars["--gradient-brand-soft"]).toMatch(/^linear-gradient\(/)
    expect(vars["--material-glass-blur"]).toMatch(/px$/)
    expect(vars["--material-elevated-shadow"]).toMatch(/\S/)

    for (let index = 1; index <= 12; index += 1) {
      const cssVar = `--chart-categorical-${index}`
      expect(vars[cssVar]).toMatch(/\S/)
    }
  })
})
