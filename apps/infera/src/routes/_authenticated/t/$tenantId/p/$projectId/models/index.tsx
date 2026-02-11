import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ProjectModelsPage } from "@/features/project/models"

function ProjectModelsRoute() {
	const { tenantId, projectId } = Route.useParams()
	return <ProjectModelsPage tenantId={tenantId} projectId={projectId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/models/")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: ProjectModelsRoute,
	staticData: {
		title: "模型库",
	},
})
