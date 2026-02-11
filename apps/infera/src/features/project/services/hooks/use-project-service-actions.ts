import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createProjectService,
  deleteProjectService,
  deployServiceRevision,
  rollbackServiceRevision,
  runPlayground,
  toggleServiceDesiredState,
  updateServiceSettings,
  updateServiceTraffic,
} from "../api"
import { getProjectServiceDetailQueryKey } from "./use-project-service-detail-query"
import { getProjectServiceWizardOptionsQueryKey } from "./use-service-wizard-options-query"

interface UseProjectServiceActionsOptions {
  tenantId: string
  projectId: string
  serviceId?: string
}

export function useProjectServiceActions({
  tenantId,
  projectId,
  serviceId,
}: UseProjectServiceActionsOptions) {
  const queryClient = useQueryClient()

  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: ["infera", "project", "services", "list", tenantId, projectId],
    })

  const invalidateDetail = () => {
    if (!serviceId) {
      return Promise.resolve()
    }
    return queryClient.invalidateQueries({
      queryKey: getProjectServiceDetailQueryKey(tenantId, projectId, serviceId),
    })
  }

  const createServiceMutation = useMutation({
    mutationFn: createProjectService,
    onSuccess: async () => {
      toast.success("服务已创建")
      await invalidateList()
      await queryClient.invalidateQueries({
        queryKey: getProjectServiceWizardOptionsQueryKey(tenantId, projectId),
      })
    },
  })

  const toggleDesiredStateMutation = useMutation({
    mutationFn: toggleServiceDesiredState,
    onSuccess: async () => {
      toast.success("期望状态已更新")
      await invalidateList()
      await invalidateDetail()
    },
  })

  const updateTrafficMutation = useMutation({
    mutationFn: updateServiceTraffic,
    onSuccess: async () => {
      toast.success("流量策略已生效")
      await invalidateList()
      await invalidateDetail()
    },
  })

  const deployRevisionMutation = useMutation({
    mutationFn: deployServiceRevision,
    onSuccess: async () => {
      toast.success("新 Revision 已部署")
      await invalidateList()
      await invalidateDetail()
    },
  })

  const rollbackMutation = useMutation({
    mutationFn: rollbackServiceRevision,
    onSuccess: async () => {
      toast.success("回滚成功，流量已切换")
      await invalidateList()
      await invalidateDetail()
    },
  })

  const updateSettingsMutation = useMutation({
    mutationFn: updateServiceSettings,
    onSuccess: async () => {
      toast.success("服务设置已保存")
      await invalidateList()
      await invalidateDetail()
    },
  })

  const deleteServiceMutation = useMutation({
    mutationFn: deleteProjectService,
    onSuccess: async () => {
      toast.success("服务已删除")
      await invalidateList()
    },
  })

  const runPlaygroundMutation = useMutation({
    mutationFn: runPlayground,
  })

  return {
    createServiceMutation,
    toggleDesiredStateMutation,
    updateTrafficMutation,
    deployRevisionMutation,
    rollbackMutation,
    updateSettingsMutation,
    deleteServiceMutation,
    runPlaygroundMutation,
  }
}
