import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { AppLayout } from "@/app/layout"
import { authStore } from "@/packages/auth-core"

function NotFoundRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    void navigate({ to: "/errors/404", replace: true })
  }, [navigate])

  return null
}

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    // Redirect to login if not authenticated
    if (!authStore.getState().isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
  notFoundComponent: NotFoundRedirect,
})

function AuthenticatedLayout() {
  const isAuthenticated = authStore((state) => state.isAuthenticated)

  // If not authenticated, don't render children to avoid triggering any authenticated queries
  // while the router is redirecting.
  if (!isAuthenticated) {
    return null
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
