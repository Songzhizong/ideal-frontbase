/**
 * Design Token System - Theme Presets
 * Pre-configured color schemes for light and dark modes
 */

import { coreBlue } from "./presets/core-blue"
import { emeraldGreen } from "./presets/emerald-green"
import { volcanoOrange } from "./presets/volcano-orange"
import type { ThemeConfig, ThemePreset } from "./types/theme"

export const themePresets: ThemePreset[] = [volcanoOrange, coreBlue, emeraldGreen]

export const defaultThemeSettings: ThemeConfig = {
  mode: "system",
  activePreset: "volcano-orange",
  fontFamily: "inter",
  layout: {
    menuLayout: "single",
    containerWidth: "fixed",
    sidebarWidth: 260,
    sidebarCollapsedWidth: 64,
    headerHeight: 64,
  },
  ui: {
    showBreadcrumb: true,
    showBreadcrumbIcon: true,
    pageAnimation: "slide-left",
    borderRadius: 16,
  },
}
