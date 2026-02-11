import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ModelDetailPage } from "@/features/project/models"

function ProjectModelDetailRoute() {
	const { tenantId, projectId, modelId } = Route.useParams()
	return <ModelDetailPage tenantId={tenantId} projectId={projectId} modelId={modelId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/models/$modelId")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: ProjectModelDetailRoute,
	staticData: {
		title: "模型详情",
	},
})
