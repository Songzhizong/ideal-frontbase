import { createRouter } from "@tanstack/react-router"
import { queryClient } from "@/app/query-client"
import { getBasePath } from "@/lib/base-path"
import { routeTree } from "@/routeTree.gen"

export const router = createRouter({
	routeTree,
	basepath: getBasePath(),
	context: {
		queryClient,
	},
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
})

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}
