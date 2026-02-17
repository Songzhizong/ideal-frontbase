import { Outlet, useRouterState } from "@tanstack/react-router"
import { SiteHeader } from "@/features/shell/layout/site-header"

export function SiteShell() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isHomePage = pathname === "/"
  const isComponentsRoute = pathname === "/components" || pathname.startsWith("/components/")

  if (isComponentsRoute) {
    return (
      <div className="relative h-dvh overflow-hidden bg-background text-foreground">
        <SiteHeader />

        <main className="absolute inset-x-0 bottom-0 top-16 overflow-hidden">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -left-24 top-56 h-64 w-64 rounded-full bg-accent/60 blur-3xl" />
        <div className="absolute -right-20 top-72 h-60 w-60 rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {isHomePage ? (
        <footer className="border-t border-border/60 bg-background/70">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-8">
            <p>Ideal Frontbase Site</p>
            <p>让模板工程的使用方式可见、可查、可复用</p>
          </div>
        </footer>
      ) : null}
    </div>
  )
}
