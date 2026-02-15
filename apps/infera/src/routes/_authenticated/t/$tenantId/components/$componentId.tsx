import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ComponentShowcasePage } from "@/features/component-showcase"

function TenantComponentShowcaseRoute() {
  const { componentId } = Route.useParams()

  return <ComponentShowcasePage componentId={componentId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/components/$componentId")({
  beforeLoad: () => {
    enforceRoutePermission({
      permission: PERMISSIONS.DASHBOARD_VIEW,
    })
  },
  component: TenantComponentShowcaseRoute,
  staticData: {
    title: "组件示例",
  },
})
