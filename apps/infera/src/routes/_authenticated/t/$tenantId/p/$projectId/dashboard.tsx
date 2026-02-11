import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ProjectDashboardPage } from "@/features/project/dashboard"

function ProjectDashboardRoute() {
	const { tenantId, projectId } = Route.useParams()
	return <ProjectDashboardPage tenantId={tenantId} projectId={projectId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/dashboard")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: ProjectDashboardRoute,
	staticData: {
		title: "项目看板",
	},
})
