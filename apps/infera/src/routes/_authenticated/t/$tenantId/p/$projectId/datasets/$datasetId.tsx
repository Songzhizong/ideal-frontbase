import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ProjectDatasetDetailPage } from "@/features/project/datasets"

function ProjectDatasetDetailRoute() {
	const { tenantId, projectId, datasetId } = Route.useParams()
	return <ProjectDatasetDetailPage tenantId={tenantId} projectId={projectId} datasetId={datasetId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/datasets/$datasetId")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: ProjectDatasetDetailRoute,
	staticData: {
		title: "数据集详情",
	},
})
