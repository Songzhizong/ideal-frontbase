import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { TenantAlertsPage } from "@/features/tenant/alerts"

function TenantAlertsRoute() {
  const { tenantId } = Route.useParams()

  return <TenantAlertsPage tenantId={tenantId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/alerts")({
  beforeLoad: () => {
    enforceRoutePermission({
      permission: PERMISSIONS.DASHBOARD_VIEW,
    })
  },
  component: TenantAlertsRoute,
  staticData: {
    title: "告警中心",
  },
})
