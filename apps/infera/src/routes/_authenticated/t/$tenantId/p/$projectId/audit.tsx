import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ProjectAuditPage } from "@/features/project/audit"

function ProjectAuditRoute() {
	const { tenantId, projectId } = Route.useParams()

	return <ProjectAuditPage tenantId={tenantId} projectId={projectId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/audit")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: ProjectAuditRoute,
	staticData: {
		title: "项目审计",
	},
})
