/**
 * List of available font names (visit the url `/settings/appearance`).
 * This array is used to generate dynamic font classes (e.g., `font-inter`, `font-manrope`).
 *
 * 📝 How to Add a New Font (Tailwind v4+):
 * 1. Add the font name here.
 * 2. Update the `<link>` tag in 'index.html' to include the new font from Google Fonts (or any other source).
 * 3. Add the new font family to 'index.css' using the `@theme inline` and `font-family` CSS variable.
 *
 * Example:
 * fonts.ts           → Add 'roboto' to this array.
 * index.html         → Add Google Fonts link for Roboto.
 * globals.css        → Add the new font in the @theme block and @layer base.
 */
export const fonts = [
  "inter",
  "manrope",
  "MiSans",
  "HarmonyOS Sans SC",
  "PingFang SC",
  "Microsoft YaHei",
  "system-ui",
] as const

export type ThemeFontFamily = (typeof fonts)[number]

export const defaultThemeFontFamily: ThemeFontFamily = "inter"

const themeFontFamilySet = new Set<string>(fonts)

export function isThemeFontFamily(value: string): value is ThemeFontFamily {
  return themeFontFamilySet.has(value)
}

export function resolveThemeFontFamily(
  value: string | undefined,
  fallback: ThemeFontFamily = defaultThemeFontFamily,
): ThemeFontFamily {
  if (typeof value === "string" && isThemeFontFamily(value)) {
    return value
  }

  return fallback
}
