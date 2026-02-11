import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  cancelFineTuningJob,
  cloneFineTuningJob,
  createFineTuningJob,
  retryFineTuningJob,
} from "../api"
import { getFineTuningWizardOptionsQueryKey } from "./use-fine-tuning-wizard-options-query"
import { getProjectFineTuningJobDetailQueryKey } from "./use-project-fine-tuning-job-detail-query"

interface UseProjectFineTuningActionsOptions {
  tenantId: string
  projectId: string
  jobId?: string
}

export function useProjectFineTuningActions({
  tenantId,
  projectId,
  jobId,
}: UseProjectFineTuningActionsOptions) {
  const queryClient = useQueryClient()

  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: ["infera", "project", "fine-tuning", tenantId, projectId],
    })

  const invalidateDetail = async () => {
    if (!jobId) {
      return
    }
    await queryClient.invalidateQueries({
      queryKey: getProjectFineTuningJobDetailQueryKey(tenantId, projectId, jobId),
    })
  }

  const createJobMutation = useMutation({
    mutationFn: createFineTuningJob,
    onSuccess: async () => {
      toast.success("微调任务已创建")
      await invalidateList()
      await queryClient.invalidateQueries({
        queryKey: getFineTuningWizardOptionsQueryKey(tenantId, projectId),
      })
    },
  })

  const cancelJobMutation = useMutation({
    mutationFn: cancelFineTuningJob,
    onSuccess: async () => {
      toast.success("任务已取消")
      await invalidateList()
      await invalidateDetail()
    },
  })

  const retryJobMutation = useMutation({
    mutationFn: retryFineTuningJob,
    onSuccess: async () => {
      toast.success("任务已重新排队")
      await invalidateList()
      await invalidateDetail()
    },
  })

  const cloneJobMutation = useMutation({
    mutationFn: cloneFineTuningJob,
    onSuccess: async () => {
      toast.success("任务克隆成功")
      await invalidateList()
    },
  })

  return {
    createJobMutation,
    cancelJobMutation,
    retryJobMutation,
    cloneJobMutation,
  }
}
