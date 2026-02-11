import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  deleteProjectDataset,
  deleteProjectDatasetVersion,
  uploadProjectDatasetVersion,
} from "../api"
import { getProjectDatasetDetailQueryKey } from "./use-project-dataset-detail-query"

interface UseProjectDatasetActionsParams {
  tenantId: string
  projectId: string
  datasetId?: string
}

export function useProjectDatasetActions({
  tenantId,
  projectId,
  datasetId,
}: UseProjectDatasetActionsParams) {
  const queryClient = useQueryClient()

  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: ["infera", "project", "datasets", tenantId, projectId],
    })

  const invalidateDetail = async () => {
    if (!datasetId) {
      return
    }
    await queryClient.invalidateQueries({
      queryKey: getProjectDatasetDetailQueryKey(tenantId, projectId, datasetId),
    })
  }

  const uploadDatasetMutation = useMutation({
    mutationFn: uploadProjectDatasetVersion,
    onSuccess: async () => {
      toast.success("数据集版本上传成功")
      await invalidateList()
      await invalidateDetail()
    },
  })

  const deleteDatasetVersionMutation = useMutation({
    mutationFn: deleteProjectDatasetVersion,
    onSuccess: async () => {
      toast.success("数据集版本已删除")
      await invalidateList()
      await invalidateDetail()
    },
  })

  const deleteDatasetMutation = useMutation({
    mutationFn: deleteProjectDataset,
    onSuccess: async () => {
      toast.success("数据集已删除")
      await invalidateList()
    },
  })

  return {
    uploadDatasetMutation,
    deleteDatasetVersionMutation,
    deleteDatasetMutation,
  }
}
