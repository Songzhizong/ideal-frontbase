import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  deleteProjectModel,
  deleteProjectModelVersion,
  promoteModelTag,
  uploadProjectModelVersion,
} from "../api"
import { getProjectModelDetailQueryKey } from "./use-project-model-detail-query"

interface UseProjectModelActionsParams {
  tenantId: string
  projectId: string
  modelId?: string
}

export function useProjectModelActions({
  tenantId,
  projectId,
  modelId,
}: UseProjectModelActionsParams) {
  const queryClient = useQueryClient()

  const invalidateModelList = () =>
    queryClient.invalidateQueries({
      queryKey: ["infera", "project", "models", tenantId, projectId],
    })

  const invalidateModelDetail = async () => {
    if (!modelId) {
      return
    }
    await queryClient.invalidateQueries({
      queryKey: getProjectModelDetailQueryKey(tenantId, projectId, modelId),
    })
  }

  const uploadModelMutation = useMutation({
    mutationFn: uploadProjectModelVersion,
    onSuccess: async () => {
      toast.success("模型上传成功")
      await invalidateModelList()
      await invalidateModelDetail()
    },
  })

  const promoteTagMutation = useMutation({
    mutationFn: promoteModelTag,
    onSuccess: async (result) => {
      if (result.allowed) {
        toast.success("Tag Promote 成功")
        await invalidateModelList()
        await invalidateModelDetail()
      }
    },
  })

  const deleteVersionMutation = useMutation({
    mutationFn: deleteProjectModelVersion,
    onSuccess: async () => {
      toast.success("模型版本已删除")
      await invalidateModelList()
      await invalidateModelDetail()
    },
  })

  const deleteModelMutation = useMutation({
    mutationFn: deleteProjectModel,
    onSuccess: async () => {
      toast.success("模型已删除")
      await invalidateModelList()
    },
  })

  return {
    uploadModelMutation,
    promoteTagMutation,
    deleteVersionMutation,
    deleteModelMutation,
  }
}
