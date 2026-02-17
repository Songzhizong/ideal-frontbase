import type React from "react"
import { createContext, useContext } from "react"
import { useThemeStore } from "../hooks/use-theme-store"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode, setMode } = useThemeStore()

  // noinspection JSUnusedGlobalSymbols
  const value = {
    theme: mode as Theme,
    setTheme: (theme: Theme) => {
      setMode(theme)
    },
  }
  return <ThemeProviderContext value={value}>{children}</ThemeProviderContext>
}
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
