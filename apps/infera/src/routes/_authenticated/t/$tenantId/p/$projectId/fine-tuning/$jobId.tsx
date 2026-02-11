import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { FineTuningJobDetailPage } from "@/features/project/fine-tuning"

function FineTuningJobDetailRoute() {
	const { tenantId, projectId, jobId } = Route.useParams()
	return <FineTuningJobDetailPage tenantId={tenantId} projectId={projectId} jobId={jobId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/fine-tuning/$jobId")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: FineTuningJobDetailRoute,
	staticData: {
		title: "微调任务详情",
	},
})
