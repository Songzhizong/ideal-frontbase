import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createProjectApiKey, revokeProjectApiKey, rotateProjectApiKey } from "../api"
import { getApiKeyScopeOptionsQueryKey } from "./use-api-key-scope-options-query"
import { getProjectApiKeyDetailQueryKey } from "./use-project-api-key-detail-query"

interface UseProjectApiKeyActionsOptions {
  tenantId: string
  projectId: string
  apiKeyId?: string
}

export function useProjectApiKeyActions({
  tenantId,
  projectId,
  apiKeyId,
}: UseProjectApiKeyActionsOptions) {
  const queryClient = useQueryClient()

  const invalidateList = () => {
    return queryClient.invalidateQueries({
      queryKey: ["infera", "project", "api-keys", "list", tenantId, projectId],
    })
  }

  const invalidateDetail = () => {
    if (!apiKeyId) {
      return Promise.resolve()
    }
    return queryClient.invalidateQueries({
      queryKey: getProjectApiKeyDetailQueryKey(tenantId, projectId, apiKeyId),
    })
  }

  const createMutation = useMutation({
    mutationFn: createProjectApiKey,
    onSuccess: async () => {
      toast.success("API Key 已创建")
      await invalidateList()
      await queryClient.invalidateQueries({
        queryKey: getApiKeyScopeOptionsQueryKey(tenantId, projectId),
      })
    },
  })

  const rotateMutation = useMutation({
    mutationFn: rotateProjectApiKey,
    onSuccess: async () => {
      toast.success("API Key 已轮换")
      await invalidateList()
      await invalidateDetail()
    },
  })

  const revokeMutation = useMutation({
    mutationFn: revokeProjectApiKey,
    onSuccess: async () => {
      toast.success("API Key 已吊销")
      await invalidateList()
      await invalidateDetail()
    },
  })

  return {
    createMutation,
    rotateMutation,
    revokeMutation,
  }
}
