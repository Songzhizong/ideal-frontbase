import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ProjectUsagePage } from "@/features/project/usage"

function ProjectUsageRoute() {
  const { tenantId, projectId } = Route.useParams()
  return <ProjectUsagePage tenantId={tenantId} projectId={projectId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/usage")({
  beforeLoad: () => {
    enforceRoutePermission({
      permission: PERMISSIONS.DASHBOARD_VIEW,
    })
  },
  component: ProjectUsageRoute,
  staticData: {
    title: "用量与成本",
  },
})
