import { Search } from "lucide-react"
import * as React from "react"
import { useThemeStore } from "@/packages/theme-system"
import { Button } from "@/packages/ui/button"
import { SidebarTrigger } from "@/packages/ui/sidebar"
import { cn } from "@/packages/ui-utils"
import type { LayoutIcon, LayoutNavItem } from "../types"
import { Breadcrumbs } from "./breadcrumbs"

interface HeaderProps {
  navItems: readonly LayoutNavItem[]
  onSearchOpen?: () => void
  actions?: React.ReactNode
  breadcrumbIconByPath?: Readonly<Record<string, LayoutIcon>>
}

export function Header({
  navItems,
  onSearchOpen,
  actions,
  breadcrumbIconByPath,
}: HeaderProps) {
  const headerHeight = useThemeStore((state) => state.layout.headerHeight)
  const menuLayout = useThemeStore((state) => state.layout.menuLayout)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMac, setIsMac] = React.useState(true)

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPod|iPad/i.test(navigator.userAgent))
    const onScroll = () => setIsScrolled(window.scrollY > 0)

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  const breadcrumbProps = {
    navItems,
    ...(breadcrumbIconByPath ? { iconByPath: breadcrumbIconByPath } : {}),
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md sm:px-6",
        isScrolled ? "border-border" : "border-transparent",
      )}
      style={{ height: `${headerHeight}px` }}
    >
      <div className="flex items-center gap-4">
        {menuLayout !== "dual" ? <SidebarTrigger /> : null}
        <Breadcrumbs {...breadcrumbProps} />
      </div>

      <div className="flex items-center gap-2">
        {onSearchOpen ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="hidden items-center gap-2 rounded-full px-4 md:flex"
              onClick={onSearchOpen}
              aria-keyshortcuts="Meta+K Control+K"
            >
              <Search className="size-4" />
              搜索
              <span className="rounded-full border border-border bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                {isMac ? "cmd k" : "ctrl k"}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 rounded-full p-0 md:hidden"
              onClick={onSearchOpen}
              aria-label="Open search"
            >
              <Search className="size-4" />
            </Button>
          </>
        ) : null}
        {actions}
      </div>
    </header>
  )
}
