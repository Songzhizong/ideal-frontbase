import { createRouter } from "@tanstack/react-router"
import { getBasePath } from "@/packages/platform-router"
import { routeTree } from "@/routeTree.gen"

export const router = createRouter({
  routeTree,
  basepath: getBasePath(),
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
