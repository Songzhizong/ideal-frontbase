import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ProjectServicesPage } from "@/features/project/services"

function ProjectServicesRoute() {
  const { tenantId, projectId } = Route.useParams()
  return <ProjectServicesPage tenantId={tenantId} projectId={projectId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/services/")({
  beforeLoad: () => {
    enforceRoutePermission({
      permission: PERMISSIONS.DASHBOARD_VIEW,
    })
  },
  component: ProjectServicesRoute,
  staticData: {
    title: "推理服务",
  },
})
