import type React from "react"
import { createContext, useContext } from "react"
import { useThemeEffects } from "../hooks/use-theme-effects"
import { useThemeStore } from "../hooks/use-theme-store"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode, setMode } = useThemeStore()
  // useThemeEffects 现在处理所有主题相关的 DOM 更新（包括类名和 CSS 变量）
  useThemeEffects()

  // noinspection JSUnusedGlobalSymbols
  const value = {
    theme: mode as Theme,
    setTheme: (theme: Theme) => {
      setMode(theme)
    },
  }
  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
