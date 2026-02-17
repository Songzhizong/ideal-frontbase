import { useRouterState } from "@tanstack/react-router"
import { Blocks, Menu, X } from "lucide-react"
import { useState } from "react"
import { BaseLink } from "@/packages/platform-router"
import { Button } from "@/packages/ui"
import { cn } from "@/packages/ui-utils"
import { SITE_NAV_ITEMS, type SiteNavItem } from "./nav-items"

interface NavItemLinkProps {
  item: SiteNavItem
  pathname: string
  onClick?: () => void
  mobile?: boolean
}

function isNavActive(pathname: string, to: string) {
  if (to === "/") {
    return pathname === "/"
  }

  return pathname.startsWith(to)
}

function NavItemLink({ item, pathname, onClick, mobile = false }: NavItemLinkProps) {
  const active = isNavActive(pathname, item.to)

  return (
    <BaseLink
      to={item.to}
      title={item.description}
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors",
        mobile
          ? cn(
              "block rounded-md px-3 py-2",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )
          : cn(
              "relative px-3 py-5 text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-100",
              active && "text-primary after:scale-x-100",
            ),
      )}
    >
      {item.label}
    </BaseLink>
  )
}

export function SiteHeader() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const appTitle = import.meta.env.VITE_APP_TITLE ?? "Ideal Frontbase"
  const isComponentDocsPage = pathname.startsWith("/components")

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-border/60",
        isComponentDocsPage ? "bg-background/95" : "bg-background/85 backdrop-blur",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BaseLink
          to="/"
          className="flex items-center gap-3 rounded-md px-2 py-1"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Blocks className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight text-foreground">{appTitle}</span>
        </BaseLink>

        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          {SITE_NAV_ITEMS.map((item) => (
            <NavItemLink key={item.to} item={item} pathname={pathname} />
          ))}
        </nav>

        <Button
          variant="ghost"
          size="lg"
          shape="square"
          className="md:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "关闭导航菜单" : "打开导航菜单"}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {mobileMenuOpen ? (
        <div
          className={cn(
            "border-t border-border/60 px-4 py-3 md:hidden",
            isComponentDocsPage ? "bg-background" : "bg-background/95 backdrop-blur",
          )}
        >
          <nav className="mx-auto grid w-full max-w-7xl gap-1" aria-label="移动端主导航">
            {SITE_NAV_ITEMS.map((item) => (
              <NavItemLink
                key={item.to}
                item={item}
                pathname={pathname}
                onClick={() => setMobileMenuOpen(false)}
                mobile
              />
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
