import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet, useNavigate } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { useEffect } from "react"

export interface RouterContext {
	queryClient: QueryClient
}

function NotFoundRedirect() {
	const navigate = useNavigate()

	useEffect(() => {
		void navigate({ to: "/errors/404", replace: true })
	}, [navigate])

	return null
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
	notFoundComponent: NotFoundRedirect,
})

function RootComponent() {
	return (
		<div className="relative min-h-screen">
			<Outlet />
			{import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
		</div>
	)
}
