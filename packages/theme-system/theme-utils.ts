/**
 * Design Token System - Core Utilities
 * Simplified to use only shadcn/ui HSL variables
 */

import { themeRootFallbacks } from "./tokens/generated/theme-root-fallbacks.generated"
import {
  themeSourceCssVariables,
  themeTokenMappings,
} from "./tokens/generated/theme-token-mappings.generated"
import type { ColorPalette, ThemeMode, ThemePreset } from "./types/theme"

type ThemeSourceVarName = (typeof themeSourceCssVariables)[number]

const hexToHSLCache = new Map<string, string>()
const flattenedPaletteCache = new WeakMap<ColorPalette, Record<string, string>>()
const flattenedPaletteWithoutFallbackCache = new WeakMap<ColorPalette, Record<string, string>>()
const externallyManagedThemeSourceVars = new Set<`--${string}`>(["--font-sans", "--radius"])
const runtimeThemeSourceVars: ReadonlyArray<ThemeSourceVarName> = themeSourceCssVariables.filter(
  (cssVar) => !externallyManagedThemeSourceVars.has(cssVar),
)
const hslThemeSourceVars = new Set<ThemeSourceVarName>()
for (const mapping of themeTokenMappings) {
  if (mapping.format === "hsl-var" && mapping.source) {
    hslThemeSourceVars.add(mapping.source)
  }
}
const missingThemeSourceVarsWarned = new Set<string>()
const shouldWarnMissingThemeSourceVars = Boolean(import.meta.env?.DEV)

function applyRuntimeThemeFallbacks(vars: Record<string, string>): void {
  for (const cssVar of runtimeThemeSourceVars) {
    const fallbackValue = themeRootFallbacks[cssVar]
    if (fallbackValue !== undefined) {
      vars[cssVar] = fallbackValue
    }
  }
}

function ensureRuntimeThemeSourceCoverage(
  vars: Record<string, string>,
  options: { includeRuntimeFallback: boolean },
): void {
  const missingVars: string[] = []

  for (const cssVar of runtimeThemeSourceVars) {
    if (Object.hasOwn(vars, cssVar)) {
      continue
    }

    if (options.includeRuntimeFallback) {
      const fallbackValue = themeRootFallbacks[cssVar]
      if (fallbackValue !== undefined) {
        vars[cssVar] = fallbackValue
        continue
      }
    }

    missingVars.push(cssVar)
  }

  if (missingVars.length === 0) {
    return
  }

  if (!options.includeRuntimeFallback) {
    throw new Error(`[theme-system] Missing runtime source css vars: ${missingVars.join(", ")}`)
  }

  if (!shouldWarnMissingThemeSourceVars) {
    return
  }

  const freshMissingVars = missingVars.filter((cssVar) => !missingThemeSourceVarsWarned.has(cssVar))
  if (freshMissingVars.length === 0) {
    return
  }

  for (const cssVar of freshMissingVars) {
    missingThemeSourceVarsWarned.add(cssVar)
  }

  console.warn(
    `[theme-system] flattenColorPalette has no value for: ${freshMissingVars.join(", ")}`,
  )
}

function resolveColor(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }
  return "#000000"
}

/**
 * Convert RGB to HSL format for CSS variables
 */
function rgbToHSL(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }
  return { h, s, l }
}

/**
 * Format HSL values to shadcn string
 */
function formatHSL(h: number, s: number, l: number, a?: number): string {
  const hsl = `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
  if (a !== undefined && a < 1) {
    return `${hsl} / ${a}`
  }
  return hsl
}

function parseRGBColor(color: string): { r: number; g: number; b: number } | null {
  const normalized = color.trim().toLowerCase()
  const rgbMatch = normalized.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/)
  if (rgbMatch?.[1] && rgbMatch?.[2] && rgbMatch?.[3]) {
    return {
      r: Number.parseInt(rgbMatch[1], 10),
      g: Number.parseInt(rgbMatch[2], 10),
      b: Number.parseInt(rgbMatch[3], 10),
    }
  }

  let cleanHex = normalized.replace(/^#/, "")
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("")
  }

  if (cleanHex.length !== 6) {
    return null
  }

  return {
    r: Number.parseInt(cleanHex.substring(0, 2), 16),
    g: Number.parseInt(cleanHex.substring(2, 4), 16),
    b: Number.parseInt(cleanHex.substring(4, 6), 16),
  }
}

function withAlpha(color: string, alpha: number): string {
  const rgb = parseRGBColor(color)
  if (!rgb) {
    return color
  }
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`
}

/**
 * Convert hex color to HSL format for CSS variables
 */
export function hexToHSL(hex: string): string {
  const normalizedHex = hex.trim().toLowerCase()
  if (!normalizedHex) return "0 0% 0%"

  const cachedHSL = hexToHSLCache.get(normalizedHex)
  if (cachedHSL) {
    return cachedHSL
  }

  let hslValue = "0 0% 0%"

  // Handle rgba strings
  if (normalizedHex.startsWith("rgba") || normalizedHex.startsWith("rgb")) {
    const match = normalizedHex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
    if (match?.[1] && match?.[2] && match?.[3]) {
      const r = Number.parseInt(match[1], 10) / 255
      const g = Number.parseInt(match[2], 10) / 255
      const b = Number.parseInt(match[3], 10) / 255
      const a = match[4] !== undefined ? Number.parseFloat(match[4]) : 1

      const { h, s, l } = rgbToHSL(r, g, b)
      hslValue = formatHSL(h, s, l, a)
      hexToHSLCache.set(normalizedHex, hslValue)
      return hslValue
    }
  }

  let cleanHex = normalizedHex.replace(/^#/, "")

  // Handle 3-digit hex
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("")
  }

  // Validate hex length
  if (cleanHex.length !== 6) {
    hexToHSLCache.set(normalizedHex, hslValue)
    return hslValue
  }

  const r = Number.parseInt(cleanHex.substring(0, 2), 16) / 255
  const g = Number.parseInt(cleanHex.substring(2, 4), 16) / 255
  const b = Number.parseInt(cleanHex.substring(4, 6), 16) / 255

  const { h, s, l } = rgbToHSL(r, g, b)
  hslValue = formatHSL(h, s, l)
  hexToHSLCache.set(normalizedHex, hslValue)
  return hslValue
}

/**
 * Flatten color palette to shadcn/ui HSL variables
 */
export interface FlattenColorPaletteOptions {
  includeRuntimeFallback?: boolean
}

export function flattenColorPalette(
  palette: ColorPalette,
  options: FlattenColorPaletteOptions = {},
): Record<string, string> {
  const includeRuntimeFallback = options.includeRuntimeFallback ?? true
  const cache = includeRuntimeFallback
    ? flattenedPaletteCache
    : flattenedPaletteWithoutFallbackCache

  const cachedPalette = cache.get(palette)
  if (cachedPalette) {
    return cachedPalette
  }

  const vars: Record<string, string> = {}
  if (includeRuntimeFallback) {
    applyRuntimeThemeFallbacks(vars)
  }
  const primary = palette.brand.primary
  const secondary = palette.brand.secondary
  const destructive = palette.destructive
  const text = palette.text
  const background = palette.background
  const border = palette.border
  const status = palette.status
  const action = palette.action
  const sidebar = palette.component.sidebar
  const effects = palette.effects
  const chartSemantic = palette.charts?.semantic
  const chartCategorical = palette.charts?.categorical ?? []

  const primaryDefault = resolveColor(primary.default, "#2563eb")
  const primaryHover = resolveColor(primary.hover, primaryDefault)
  const primaryFg = resolveColor(primary.fg, "#ffffff")
  const primarySubtle = resolveColor(
    primary.subtle,
    background.accent.default,
    "rgba(37,99,235,0.1)",
  )
  const primaryOnSubtle = resolveColor(primary.onSubtle, primaryDefault, "#1e40af")
  const primaryBorder = resolveColor(primary.border, border.focus, primaryDefault)
  const secondaryDefault = resolveColor(secondary.default, background.muted.default, "#64748b")
  const secondaryHover = resolveColor(secondary.hover, background.muted.default, secondaryDefault)
  const secondaryFg = resolveColor(secondary.fg, text.primary, "#ffffff")
  const secondarySubtle = resolveColor(secondary.subtle, background.muted.default, secondaryDefault)
  const secondaryOnSubtle = resolveColor(
    secondary.onSubtle,
    text.secondary,
    text.primary,
    "#334155",
  )
  const secondaryBorder = resolveColor(secondary.border, border.base, "#e2e8f0")
  const destructiveDefault = resolveColor(destructive.default, status.error.default, "#dc2626")
  const destructiveHover = resolveColor(destructive.hover, status.error.hover, destructiveDefault)
  const destructiveFg = resolveColor(destructive.fg, "#ffffff")
  const destructiveSubtle = resolveColor(
    destructive.subtle,
    status.error.subtle,
    "rgba(220,38,38,0.1)",
  )
  const destructiveOnSubtle = resolveColor(destructive.onSubtle, status.error.onSubtle, "#991b1b")
  const destructiveBorder = resolveColor(
    destructive.border,
    status.error.border,
    destructiveDefault,
  )

  const foreground = resolveColor(text.primary, "#020617")
  const textSecondary = resolveColor(text.secondary, "#334155")
  const textTertiary = resolveColor(text.tertiary, "#64748b")
  const textPlaceholder = resolveColor(text.placeholder, textTertiary, "#94a3b8")
  const textDisabled = resolveColor(text.disabled, "#94a3b8")
  const textInverse = resolveColor(text.inverse, "#ffffff")
  const linkDefault = resolveColor(text.link.default, primaryDefault)
  const linkHover = resolveColor(text.link.hover, primaryHover, linkDefault)
  const backgroundApp = resolveColor(background.app, "#ffffff")
  const backgroundSurface = resolveColor(background.surface, backgroundApp, "#ffffff")
  const backgroundOverlay = resolveColor(background.overlay, backgroundSurface, "#ffffff")
  const backgroundInput = resolveColor(
    background.input,
    backgroundSurface,
    backgroundApp,
    "#ffffff",
  )
  const backgroundMuted = resolveColor(background.muted.default, backgroundSurface, "#f1f5f9")
  const backgroundMutedFg = resolveColor(
    background.muted.fg,
    textTertiary,
    textSecondary,
    "#64748b",
  )
  const backgroundAccent = resolveColor(
    background.accent.default,
    primarySubtle,
    backgroundMuted,
    "#e2e8f0",
  )
  const backgroundAccentFg = resolveColor(background.accent.fg, foreground, "#020617")
  const borderBase = resolveColor(border.base, "#e2e8f0")
  const borderStrong = resolveColor(border.strong, borderBase, "#cbd5e1")
  const borderSubtle = resolveColor(border.subtle, borderBase, "#f1f5f9")
  const ring = resolveColor(border.focus, primaryDefault, "#2563eb")

  const successDefault = resolveColor(status.success.default, "#16a34a")
  const successHover = resolveColor(status.success.hover, successDefault)
  const successFg = resolveColor(status.success.fg, "#ffffff")
  const successSubtle = resolveColor(status.success.subtle, primarySubtle, backgroundMuted)
  const successOnSubtle = resolveColor(status.success.onSubtle, foreground, "#166534")
  const successBorder = resolveColor(status.success.border, successDefault)

  const warningDefault = resolveColor(status.warning.default, "#f59e0b")
  const warningHover = resolveColor(status.warning.hover, warningDefault)
  const warningFg = resolveColor(status.warning.fg, "#ffffff")
  const warningSubtle = resolveColor(status.warning.subtle, backgroundMuted)
  const warningOnSubtle = resolveColor(status.warning.onSubtle, foreground, "#92400e")
  const warningBorder = resolveColor(status.warning.border, warningDefault)

  const errorDefault = resolveColor(status.error.default, "#dc2626")
  const errorHover = resolveColor(status.error.hover, errorDefault)
  const errorFg = resolveColor(status.error.fg, "#ffffff")
  const errorSubtle = resolveColor(status.error.subtle, destructiveSubtle, backgroundMuted)
  const errorOnSubtle = resolveColor(status.error.onSubtle, foreground, "#7f1d1d")
  const errorBorder = resolveColor(status.error.border, errorDefault)

  const infoDefault = resolveColor(status.info.default, primaryDefault, "#2563eb")
  const infoHover = resolveColor(status.info.hover, infoDefault)
  const infoFg = resolveColor(status.info.fg, "#ffffff")
  const infoSubtle = resolveColor(status.info.subtle, primarySubtle, backgroundMuted)
  const infoOnSubtle = resolveColor(status.info.onSubtle, foreground, "#1e3a8a")
  const infoBorder = resolveColor(status.info.border, infoDefault)

  const selection = resolveColor(action?.selection, primarySubtle, "rgba(37,99,235,0.25)")
  const disabledBg = resolveColor(action?.disabled?.bg, backgroundMuted, "#f1f5f9")
  // Disabled token priority: component-level action.disabled.* > global text.disabled fallback.
  const disabledText = resolveColor(action?.disabled?.text, textDisabled, "#94a3b8")
  const disabledBorder = resolveColor(action?.disabled?.border, borderBase, "#e2e8f0")
  const skeletonBase = resolveColor(action?.skeleton?.base, backgroundMuted, "#e5e7eb")
  const skeletonShimmer = resolveColor(action?.skeleton?.shimmer, backgroundSurface, "#f1f5f9")
  const scrollbarThumb = resolveColor(action?.scrollbar?.thumb, borderBase, "#cbd5e1")
  const scrollbarHover = resolveColor(action?.scrollbar?.hover, backgroundMutedFg, "#94a3b8")

  const shadowSm = resolveColor(effects?.shadow?.sm, "0 1px 2px rgba(2,6,23,0.06)")
  const shadowMd = resolveColor(effects?.shadow?.md, "0 4px 12px rgba(2,6,23,0.08)")
  const shadowLg = resolveColor(effects?.shadow?.lg, "0 12px 32px rgba(2,6,23,0.12)")
  const glow = resolveColor(effects?.glow, `0 0 0 1px ${primarySubtle}`)

  const chartPositive = resolveColor(chartSemantic?.positive, successDefault)
  const chartNegative = resolveColor(chartSemantic?.negative, errorDefault)
  const chartNeutral = resolveColor(chartSemantic?.neutral, textTertiary)
  const chartWarning = resolveColor(chartSemantic?.warning, warningDefault)
  const chartCategoricalFallbacks = [
    primaryDefault,
    successDefault,
    warningDefault,
    errorDefault,
    infoDefault,
    linkDefault,
    secondaryDefault,
    foreground,
    textSecondary,
    textTertiary,
    backgroundAccentFg,
    borderStrong,
  ]
  const chartCategoricalColors = Array.from({ length: 12 }, (_, index) =>
    resolveColor(chartCategorical[index], chartCategoricalFallbacks[index]),
  )

  const gradientBrand = resolveColor(
    effects?.gradient?.brand,
    `linear-gradient(135deg, ${primaryDefault} 0%, ${infoDefault} 100%)`,
  )
  const gradientBrandSoft = resolveColor(
    effects?.gradient?.brandSoft,
    `linear-gradient(135deg, ${primarySubtle} 0%, ${infoSubtle} 100%)`,
  )
  const materialGlassBg = resolveColor(
    effects?.material?.glass?.bg,
    withAlpha(backgroundSurface, 0.68),
    "rgba(255,255,255,0.68)",
  )
  const materialGlassBorder = resolveColor(
    effects?.material?.glass?.border,
    withAlpha(borderStrong, 0.45),
    "rgba(148,163,184,0.45)",
  )
  const materialGlassBlur = resolveColor(effects?.material?.glass?.blur, "14px")
  const materialElevatedBg = resolveColor(
    effects?.material?.elevated?.bg,
    withAlpha(backgroundSurface, 0.92),
    backgroundSurface,
  )
  const materialElevatedBorder = resolveColor(
    effects?.material?.elevated?.border,
    withAlpha(borderBase, 0.8),
    borderBase,
  )
  const materialElevatedShadow = resolveColor(effects?.material?.elevated?.shadow, shadowMd)

  const tableHeaderBg = resolveColor(background.muted.default, backgroundSurface, backgroundApp)
  const tableRowHover = resolveColor(background.accent.default, backgroundMuted, backgroundSurface)
  const tableBorder = resolveColor(borderSubtle, borderBase)
  const tableHeaderFgDefault = resolveColor(textSecondary, textTertiary, foreground)
  const tableHeaderFgSubtle = resolveColor(textTertiary, textSecondary, foreground)
  const tableHeaderFgDense = resolveColor(textSecondary, foreground)
  const tableRowHoverDefault = resolveColor(
    background.accent.default,
    tableRowHover,
    backgroundMuted,
  )
  const tableRowHoverSubtle = resolveColor(
    background.muted.default,
    tableRowHover,
    backgroundAccent,
  )
  const tableRowHoverDense = resolveColor(background.accent.default, tableRowHover)
  const tableRowSelectedDefault = resolveColor(
    status.info.subtle,
    background.accent.default,
    tableRowHover,
  )
  const tableRowSelectedSubtle = resolveColor(
    background.accent.default,
    status.info.subtle,
    tableRowHover,
  )
  const tableRowSelectedDense = resolveColor(status.info.subtle, tableRowHover)

  const overlayColor = resolveColor(background.mask, "rgba(15,23,42,0.45)")
  const sidebarBackground = resolveColor(sidebar.bg, backgroundApp)
  const sidebarForeground = resolveColor(sidebar.fg, foreground)
  const sidebarAccent = resolveColor(sidebar.accent, backgroundAccent)
  const sidebarAccentForeground = resolveColor(sidebar.onAccent, backgroundAccentFg)
  const sidebarBorder = resolveColor(sidebar.border, borderBase)
  const sidebarRing = resolveColor(sidebar.ring, ring)

  const sourceValues: Partial<Record<ThemeSourceVarName, string>> = {
    "--primary": primaryDefault,
    "--primary-hover": primaryHover,
    "--primary-foreground": primaryFg,
    "--primary-subtle": primarySubtle,
    "--primary-on-subtle": primaryOnSubtle,
    "--primary-border": primaryBorder,
    "--secondary": secondaryDefault,
    "--secondary-hover": secondaryHover,
    "--secondary-foreground": secondaryFg,
    "--secondary-subtle": secondarySubtle,
    "--secondary-on-subtle": secondaryOnSubtle,
    "--secondary-border": secondaryBorder,
    "--destructive": destructiveDefault,
    "--destructive-hover": destructiveHover,
    "--destructive-foreground": destructiveFg,
    "--destructive-subtle": destructiveSubtle,
    "--destructive-on-subtle": destructiveOnSubtle,
    "--destructive-border": destructiveBorder,
    "--foreground": foreground,
    "--text-secondary": textSecondary,
    "--text-tertiary": textTertiary,
    "--text-placeholder": textPlaceholder,
    "--text-disabled": textDisabled,
    "--text-inverse": textInverse,
    "--link": linkDefault,
    "--link-hover": linkHover,
    "--background": backgroundApp,
    "--card": backgroundSurface,
    "--card-foreground": foreground,
    "--popover": backgroundOverlay,
    "--popover-foreground": foreground,
    "--muted": backgroundMuted,
    "--muted-foreground": backgroundMutedFg,
    "--accent": backgroundAccent,
    "--accent-foreground": backgroundAccentFg,
    "--border": borderBase,
    "--border-strong": borderStrong,
    "--border-subtle": borderSubtle,
    "--input-background": backgroundInput,
    "--input": borderBase,
    "--ring": ring,
    "--overlay": overlayColor,
    "--sidebar-background": sidebarBackground,
    "--sidebar-foreground": sidebarForeground,
    "--sidebar-primary": primaryDefault,
    "--sidebar-primary-foreground": primaryFg,
    "--sidebar-accent": sidebarAccent,
    "--sidebar-accent-foreground": sidebarAccentForeground,
    "--sidebar-border": sidebarBorder,
    "--sidebar-ring": sidebarRing,
    "--success": successDefault,
    "--success-hover": successHover,
    "--success-border": successBorder,
    "--success-foreground": successFg,
    "--success-subtle": successSubtle,
    "--success-on-subtle": successOnSubtle,
    "--warning": warningDefault,
    "--warning-hover": warningHover,
    "--warning-border": warningBorder,
    "--warning-foreground": warningFg,
    "--warning-subtle": warningSubtle,
    "--warning-on-subtle": warningOnSubtle,
    "--error": errorDefault,
    "--error-hover": errorHover,
    "--error-border": errorBorder,
    "--error-foreground": errorFg,
    "--error-subtle": errorSubtle,
    "--error-on-subtle": errorOnSubtle,
    "--info": infoDefault,
    "--info-hover": infoHover,
    "--info-border": infoBorder,
    "--info-foreground": infoFg,
    "--info-subtle": infoSubtle,
    "--info-on-subtle": infoOnSubtle,
    "--selection": selection,
    "--disabled-bg": disabledBg,
    "--disabled-text": disabledText,
    "--disabled-border": disabledBorder,
    "--skeleton-base": skeletonBase,
    "--skeleton-shimmer": skeletonShimmer,
    "--scrollbar-thumb": scrollbarThumb,
    "--scrollbar-thumb-hover": scrollbarHover,
    "--chart-positive": chartPositive,
    "--chart-negative": chartNegative,
    "--chart-neutral": chartNeutral,
    "--chart-warning": chartWarning,
    "--material-glass-bg": materialGlassBg,
    "--material-glass-border": materialGlassBorder,
    "--material-elevated-bg": materialElevatedBg,
    "--material-elevated-border": materialElevatedBorder,
    "--table-header-bg": tableHeaderBg,
    "--table-row-hover": tableRowHover,
    "--table-border": tableBorder,
    "--table-header-fg-default": tableHeaderFgDefault,
    "--table-header-fg-subtle": tableHeaderFgSubtle,
    "--table-header-fg-dense": tableHeaderFgDense,
    "--table-row-hover-default": tableRowHoverDefault,
    "--table-row-hover-subtle": tableRowHoverSubtle,
    "--table-row-hover-dense": tableRowHoverDense,
    "--table-row-selected-default": tableRowSelectedDefault,
    "--table-row-selected-subtle": tableRowSelectedSubtle,
    "--table-row-selected-dense": tableRowSelectedDense,
    "--shadow-sm": shadowSm,
    "--shadow-md": shadowMd,
    "--shadow-lg": shadowLg,
    "--glow": glow,
    "--gradient-brand": gradientBrand,
    "--gradient-brand-soft": gradientBrandSoft,
    "--material-glass-blur": materialGlassBlur,
    "--material-elevated-shadow": materialElevatedShadow,
    "--table-head-height-default": "2.25rem",
    "--table-head-height-subtle": "2.25rem",
    "--table-head-height-dense": "2rem",
    "--table-cell-x-default": "0.5rem",
    "--table-cell-x-subtle": "0.5rem",
    "--table-cell-x-dense": "0.375rem",
    "--table-cell-py-compact-default": "0.375rem",
    "--table-cell-py-compact-subtle": "0.375rem",
    "--table-cell-py-compact-dense": "0.25rem",
    "--table-cell-py-comfortable-default": "0.75rem",
    "--table-cell-py-comfortable-subtle": "0.75rem",
    "--table-cell-py-comfortable-dense": "0.625rem",
  }

  for (const [index, color] of chartCategoricalColors.entries()) {
    sourceValues[`--chart-categorical-${index + 1}`] = color
  }

  for (const cssVar of runtimeThemeSourceVars) {
    const sourceValue = sourceValues[cssVar]
    if (typeof sourceValue !== "string" || sourceValue.trim().length === 0) {
      continue
    }

    vars[cssVar] = hslThemeSourceVars.has(cssVar) ? hexToHSL(sourceValue) : sourceValue
  }

  ensureRuntimeThemeSourceCoverage(vars, { includeRuntimeFallback })
  cache.set(palette, vars)
  return vars
}

/**
 * Apply theme to DOM by injecting CSS variables
 */
export function updateThemeVariables(
  preset: ThemePreset,
  mode: ThemeMode,
): Readonly<Record<string, string>> {
  const palette = preset.schemes[mode]
  const cssVars = flattenColorPalette(palette)

  const root = document.documentElement

  // Apply all CSS variables
  for (const [key, value] of Object.entries(cssVars)) {
    root.style.setProperty(key, value)
  }

  // Update data attribute for mode-specific styling
  root.setAttribute("data-theme", mode)
  return cssVars
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/**
 * Resolve effective theme mode (handles "system" option)
 */
export function resolveThemeMode(configMode: "light" | "dark" | "system"): ThemeMode {
  if (configMode === "system") {
    return getSystemTheme()
  }
  return configMode
}
