import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { EvaluationDetailPage } from "@/features/project/evaluation"

function EvaluationDetailRoute() {
	const { tenantId, projectId, evalRunId } = Route.useParams()
	return <EvaluationDetailPage tenantId={tenantId} projectId={projectId} evalRunId={evalRunId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/evaluation/$evalRunId")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: EvaluationDetailRoute,
	staticData: {
		title: "评估详情",
	},
})
