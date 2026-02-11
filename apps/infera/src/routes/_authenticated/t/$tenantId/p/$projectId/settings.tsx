import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ProjectSettingsPage } from "@/features/project/settings"

function ProjectSettingsRoute() {
	const { tenantId, projectId } = Route.useParams()
	return <ProjectSettingsPage tenantId={tenantId} projectId={projectId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/settings")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: ProjectSettingsRoute,
	staticData: {
		title: "项目设置",
	},
})
