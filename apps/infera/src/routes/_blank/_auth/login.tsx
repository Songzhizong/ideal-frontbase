import { createFileRoute, redirect } from "@tanstack/react-router"
import { LoginPage } from "@/features/core/auth/components/login-page"
import { resolveDefaultTenantId } from "@/features/core/auth/utils/resolve-default-tenant-id"
import { authStore } from "@/packages/auth-core"

export const Route = createFileRoute("/_blank/_auth/login")({
  beforeLoad: ({ location }) => {
    // Redirect to home if already authenticated
    if (authStore.getState().isAuthenticated) {
      const tenantId = resolveDefaultTenantId(authStore.getState())
      throw redirect({
        to: "/t/$tenantId/overview",
        params: {
          tenantId,
        },
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: LoginPage,
})
