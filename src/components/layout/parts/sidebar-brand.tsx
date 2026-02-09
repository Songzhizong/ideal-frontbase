import * as React from "react"
import AppLogo from "@/assets/logo.svg"
import { useSidebar } from "@/components/ui/sidebar"
import { useThemeStore } from "@/hooks/use-theme-store"
import { cn } from "@/lib/utils"

export function SidebarBrand() {
  const { state, isMobile } = useSidebar()
  const menuLayout = useThemeStore((state) => state.layout.menuLayout)
  const collapsed = (state === "collapsed" && !isMobile) || menuLayout === "dual"
  const appTitle = import.meta.env.VITE_APP_TITLE ?? "App"
  React.useMemo(() => {
    if (import.meta.env.MODE === "development") return "DEV"
    if (import.meta.env.MODE === "production") return "PROD"
    if (import.meta.env.MODE === "test") return "TEST"
    return import.meta.env.MODE.toUpperCase()
  }, [])
  return (
    <div className={cn("flex h-14 items-center gap-2 px-5", collapsed && "justify-center px-0")}>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary">
        <img src={AppLogo} alt={`${appTitle} logo`} className="h-4 w-4 brightness-0 invert" />
      </div>
      {!collapsed && (
        <span className="min-w-0 truncate text-base font-bold tracking-tight text-foreground">
          {appTitle}
        </span>
      )}
    </div>
  )
}
