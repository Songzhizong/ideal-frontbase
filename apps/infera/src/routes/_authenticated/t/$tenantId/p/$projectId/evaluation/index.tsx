import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ProjectEvaluationPage } from "@/features/project/evaluation"

function ProjectEvaluationRoute() {
	const { tenantId, projectId } = Route.useParams()
	return <ProjectEvaluationPage tenantId={tenantId} projectId={projectId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/evaluation/")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: ProjectEvaluationRoute,
	staticData: {
		title: "模型评估",
	},
})
