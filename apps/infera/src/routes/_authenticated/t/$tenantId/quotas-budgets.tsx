import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { TenantQuotasBudgetsPage } from "@/features/tenant/quotas-budgets"

function TenantQuotasBudgetsRoute() {
  const { tenantId } = Route.useParams()
  return <TenantQuotasBudgetsPage tenantId={tenantId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/quotas-budgets")({
  beforeLoad: () => {
    enforceRoutePermission({
      permission: PERMISSIONS.DASHBOARD_VIEW,
    })
  },
  component: TenantQuotasBudgetsRoute,
  staticData: {
    title: "配额与预算",
  },
})
