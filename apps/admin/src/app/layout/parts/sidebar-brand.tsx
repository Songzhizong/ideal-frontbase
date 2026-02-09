import AppLogo from "@/assets/logo.svg"
import { useThemeStore } from "@/packages/theme-system"
import { useSidebar } from "@/packages/ui/sidebar"
import { cn } from "@/packages/ui-utils"

export function SidebarBrand() {
  const { state, isMobile } = useSidebar()
  const menuLayout = useThemeStore((themeState) => themeState.layout.menuLayout)
  const collapsed = (state === "collapsed" && !isMobile) || menuLayout === "dual"
  const appTitle = import.meta.env.VITE_APP_TITLE ?? "App"

  return (
    <div
      className={cn("flex h-14 items-center gap-2 px-5", collapsed ? "justify-center px-0" : null)}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary">
        <img src={AppLogo} alt={`${appTitle} logo`} className="h-4 w-4 brightness-0 invert" />
      </div>
      {!collapsed ? (
        <span className="min-w-0 truncate text-base font-bold tracking-tight text-foreground">
          {appTitle}
        </span>
      ) : null}
    </div>
  )
}
