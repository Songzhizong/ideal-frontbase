import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  addProjectMember,
  createProjectServiceAccount,
  deleteProject,
  deleteProjectServiceAccount,
  removeProjectMember,
  rotateProjectServiceAccountToken,
  saveProjectEnvironmentPolicies,
  saveProjectQuotaPolicy,
  toggleProjectServiceAccountStatus,
  updateProjectMemberRole,
  updateProjectOverview,
} from "../api"
import { getProjectSettingsQueryKey } from "./use-project-settings-query"

interface UseProjectSettingsActionsParams {
  tenantId: string
  projectId: string
}

export function useProjectSettingsActions({
  tenantId,
  projectId,
}: UseProjectSettingsActionsParams) {
  const queryClient = useQueryClient()
  const queryKey = getProjectSettingsQueryKey(tenantId, projectId)

  const invalidateSettings = () => queryClient.invalidateQueries({ queryKey })

  const updateOverviewMutation = useMutation({
    mutationFn: updateProjectOverview,
    onSuccess: async () => {
      toast.success("项目概览已更新")
      await invalidateSettings()
    },
  })

  const addMemberMutation = useMutation({
    mutationFn: addProjectMember,
    onSuccess: async () => {
      toast.success("成员已添加")
      await invalidateSettings()
    },
  })

  const updateMemberRoleMutation = useMutation({
    mutationFn: updateProjectMemberRole,
    onSuccess: async () => {
      toast.success("成员角色已更新")
      await invalidateSettings()
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: removeProjectMember,
    onSuccess: async () => {
      toast.success("成员已移除")
      await invalidateSettings()
    },
  })

  const createServiceAccountMutation = useMutation({
    mutationFn: createProjectServiceAccount,
    onSuccess: async () => {
      toast.success("服务账号已创建")
      await invalidateSettings()
    },
  })

  const rotateServiceAccountTokenMutation = useMutation({
    mutationFn: rotateProjectServiceAccountToken,
  })

  const toggleServiceAccountMutation = useMutation({
    mutationFn: toggleProjectServiceAccountStatus,
    onSuccess: async () => {
      toast.success("服务账号状态已更新")
      await invalidateSettings()
    },
  })

  const deleteServiceAccountMutation = useMutation({
    mutationFn: deleteProjectServiceAccount,
    onSuccess: async () => {
      toast.success("服务账号已删除")
      await invalidateSettings()
    },
  })

  const saveQuotaPolicyMutation = useMutation({
    mutationFn: saveProjectQuotaPolicy,
    onSuccess: async () => {
      toast.success("配额与预算策略已保存")
      await invalidateSettings()
    },
  })

  const saveEnvironmentPoliciesMutation = useMutation({
    mutationFn: saveProjectEnvironmentPolicies,
    onSuccess: async () => {
      toast.success("环境策略已保存")
      await invalidateSettings()
    },
  })

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: async () => {
      toast.success("项目已删除")
      await invalidateSettings()
    },
  })

  return {
    updateOverviewMutation,
    addMemberMutation,
    updateMemberRoleMutation,
    removeMemberMutation,
    createServiceAccountMutation,
    rotateServiceAccountTokenMutation,
    toggleServiceAccountMutation,
    deleteServiceAccountMutation,
    saveQuotaPolicyMutation,
    saveEnvironmentPoliciesMutation,
    deleteProjectMutation,
  }
}
