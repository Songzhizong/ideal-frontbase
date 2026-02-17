import { createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { SiteShell } from "@/features/shell/layout/site-shell"
import { BaseLink } from "@/packages/platform-router"
import { Button } from "@/packages/ui"

function SiteNotFound() {
  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-lg flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-semibold tracking-tight">页面不存在</h2>
      <p className="text-sm leading-6 text-muted-foreground">请从顶部导航返回可访问的官网页面。</p>
      <Button asChild>
        <BaseLink to="/">返回首页</BaseLink>
      </Button>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: SiteNotFound,
})

function RootComponent() {
  return (
    <>
      <SiteShell />
      {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
    </>
  )
}
