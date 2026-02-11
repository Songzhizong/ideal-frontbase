import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ProjectDatasetsPage } from "@/features/project/datasets"

function ProjectDatasetsRoute() {
	const { tenantId, projectId } = Route.useParams()
	return <ProjectDatasetsPage tenantId={tenantId} projectId={projectId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/datasets/")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: ProjectDatasetsRoute,
	staticData: {
		title: "数据集",
	},
})
