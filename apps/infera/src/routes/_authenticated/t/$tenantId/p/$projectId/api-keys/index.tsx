import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ProjectApiKeysPage } from "@/features/project/api-keys"

function ProjectApiKeysRoute() {
  const { tenantId, projectId } = Route.useParams()
  return <ProjectApiKeysPage tenantId={tenantId} projectId={projectId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/api-keys/")({
  beforeLoad: () => {
    enforceRoutePermission({
      permission: PERMISSIONS.DASHBOARD_VIEW,
    })
  },
  component: ProjectApiKeysRoute,
  staticData: {
    title: "API Keys",
  },
})
