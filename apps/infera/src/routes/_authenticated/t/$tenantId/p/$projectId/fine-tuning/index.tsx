import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ProjectFineTuningPage } from "@/features/project/fine-tuning"

function ProjectFineTuningRoute() {
	const { tenantId, projectId } = Route.useParams()
	return <ProjectFineTuningPage tenantId={tenantId} projectId={projectId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/fine-tuning/")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: ProjectFineTuningRoute,
	staticData: {
		title: "微调任务",
	},
})
