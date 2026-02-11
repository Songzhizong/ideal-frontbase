import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ackProjectDashboardAlert } from "../api"

interface UseProjectDashboardActionsOptions {
  tenantId: string
  projectId: string
}

function invalidateProjectDashboardQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  tenantId: string,
  projectId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: ["infera", "project", "dashboard", tenantId, projectId],
  })
}

export function useProjectDashboardActions({
  tenantId,
  projectId,
}: UseProjectDashboardActionsOptions) {
  const queryClient = useQueryClient()

  const ackAlert = useMutation({
    mutationFn: (alertId: string) =>
      ackProjectDashboardAlert({
        tenantId,
        projectId,
        alertId,
      }),
    onSuccess: () => {
      toast.success("告警已确认")
      invalidateProjectDashboardQueries(queryClient, tenantId, projectId)
    },
  })

  return {
    ackAlert,
  }
}
