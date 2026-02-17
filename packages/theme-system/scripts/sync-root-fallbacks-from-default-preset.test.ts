/// <reference types="node" />

import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { defaultThemeSettings, themePresets } from "../theme-presets"
import { flattenColorPalette } from "../theme-utils"
import { type CssVariableName, tokenSchema } from "../tokens/schema"

type RootFallbackTuple = readonly [CssVariableName, string]

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageRoot = path.resolve(__dirname, "..")
const rootFallbackSchemaPath = path.join(packageRoot, "tokens", "schema", "root-fallbacks.json")
const ignoredSourceVars = new Set<CssVariableName>(["--font-sans"])
const fixedRootFallbackValues: Readonly<Record<CssVariableName, string>> = {
  "--radius": `${defaultThemeSettings.ui.borderRadius}px`,
  "--last-click-x": "0px",
  "--last-click-y": "0px",
  "--last-click-offset-x": "0px",
  "--last-click-offset-y": "0px",
}

function isCssVariableName(value: unknown): value is CssVariableName {
  return typeof value === "string" && /^--[a-z0-9-]+$/.test(value)
}

function isRootFallbackTuple(value: unknown): value is RootFallbackTuple {
  if (!Array.isArray(value) || value.length !== 2) {
    return false
  }

  const name = value[0]
  const tokenValue = value[1]
  return isCssVariableName(name) && typeof tokenValue === "string" && tokenValue.trim().length > 0
}

function readCurrentRootFallbacks(): ReadonlyArray<RootFallbackTuple> {
  const raw = readFileSync(rootFallbackSchemaPath, "utf8")
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed) || !parsed.every((entry) => isRootFallbackTuple(entry))) {
    throw new Error("Invalid root fallback schema file format.")
  }
  return parsed
}

function parseSourceCssVariable(expression: string): CssVariableName | null {
  const hslVarMatch = expression.match(/^hsl\(var\((--[a-z0-9-]+)\)\)$/)
  if (hslVarMatch?.[1] && isCssVariableName(hslVarMatch[1])) {
    return hslVarMatch[1]
  }

  const varMatch = expression.match(/^var\((--[a-z0-9-]+)\)$/)
  if (varMatch?.[1] && isCssVariableName(varMatch[1])) {
    return varMatch[1]
  }

  return null
}

function collectRequiredSourceVars(): ReadonlyArray<CssVariableName> {
  const collected: CssVariableName[] = []
  const seen = new Set<CssVariableName>()

  for (const [, expression] of tokenSchema.themeDeclarations) {
    const sourceVar = parseSourceCssVariable(expression)
    if (!sourceVar || ignoredSourceVars.has(sourceVar) || seen.has(sourceVar)) {
      continue
    }

    seen.add(sourceVar)
    collected.push(sourceVar)
  }

  return collected
}

function formatRootFallbacks(tuples: ReadonlyArray<RootFallbackTuple>): string {
  const lines = ["["]
  for (const [index, tuple] of tuples.entries()) {
    const suffix = index === tuples.length - 1 ? "" : ","
    const tupleName = JSON.stringify(tuple[0])
    const tupleValue = JSON.stringify(tuple[1])
    const inlineTuple = `  [${tupleName}, ${tupleValue}]${suffix}`

    if (inlineTuple.length <= 96) {
      lines.push(inlineTuple)
      continue
    }

    lines.push("  [")
    lines.push(`    ${tupleName},`)
    lines.push(`    ${tupleValue}`)
    lines.push(`  ]${suffix}`)
  }
  lines.push("]", "")
  return lines.join("\n")
}

describe("sync root fallback schema", () => {
  it("generates root fallback values from default preset", () => {
    const defaultPreset =
      themePresets.find((preset) => preset.key === defaultThemeSettings.activePreset) ??
      themePresets[0]
    if (!defaultPreset) {
      throw new Error("No default theme preset found.")
    }

    const flattened = flattenColorPalette(defaultPreset.schemes.light, {
      includeRuntimeFallback: false,
    })
    const currentRootFallbacks = readCurrentRootFallbacks()
    const requiredSourceVars = collectRequiredSourceVars()
    const requiredSourceVarSet = new Set(requiredSourceVars)
    const nextMap = new Map<CssVariableName, string>()

    for (const sourceVar of requiredSourceVars) {
      const fixedValue = fixedRootFallbackValues[sourceVar]
      if (fixedValue !== undefined) {
        nextMap.set(sourceVar, fixedValue)
        continue
      }

      const runtimeValue = flattened[sourceVar]
      if (typeof runtimeValue !== "string" || runtimeValue.trim().length === 0) {
        throw new Error(`Missing flattened token value for ${sourceVar}.`)
      }
      nextMap.set(sourceVar, runtimeValue)
    }

    for (const [cssVar, value] of currentRootFallbacks) {
      if (!requiredSourceVarSet.has(cssVar) && !nextMap.has(cssVar)) {
        nextMap.set(cssVar, value)
      }
    }

    for (const [cssVar, value] of Object.entries(fixedRootFallbackValues)) {
      if (isCssVariableName(cssVar)) {
        nextMap.set(cssVar, value)
      }
    }

    const currentOrder = currentRootFallbacks.map(([cssVar]) => cssVar)
    const additionalKeys = [...nextMap.keys()]
      .filter((cssVar) => !currentOrder.includes(cssVar))
      .sort()
    const orderedKeys = [...currentOrder.filter((cssVar) => nextMap.has(cssVar)), ...additionalKeys]
    const nextRootFallbacks: RootFallbackTuple[] = orderedKeys.map((cssVar) => {
      const value = nextMap.get(cssVar)
      if (value === undefined) {
        throw new Error(`Unable to resolve fallback value for ${cssVar}.`)
      }
      return [cssVar, value]
    })

    const nextContent = formatRootFallbacks(nextRootFallbacks)
    const currentContent = readFileSync(rootFallbackSchemaPath, "utf8")
    if (currentContent !== nextContent) {
      writeFileSync(rootFallbackSchemaPath, nextContent, "utf8")
    }

    expect(nextRootFallbacks.length).toBeGreaterThan(0)
  })
})
