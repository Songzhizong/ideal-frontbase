import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { BaseLayout } from "@/components/layout/base-layout.tsx"

export interface RouterContext {
	queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
})

function RootComponent() {
	return (
		<div className="relative min-h-screen">
			<div className="relative">
				<BaseLayout>
					<Outlet />
				</BaseLayout>
			</div>
			{import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
		</div>
	)
}
