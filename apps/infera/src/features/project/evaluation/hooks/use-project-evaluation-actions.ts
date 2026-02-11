import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createEvaluationRun,
  promoteEvaluationResult,
  rerunEvaluationRun,
  updateEvaluationReview,
} from "../api"
import { getEvaluationWizardOptionsQueryKey } from "./use-evaluation-wizard-options-query"
import { getProjectEvaluationDetailQueryKey } from "./use-project-evaluation-detail-query"

interface UseProjectEvaluationActionsOptions {
  tenantId: string
  projectId: string
  evalRunId?: string
}

export function useProjectEvaluationActions({
  tenantId,
  projectId,
  evalRunId,
}: UseProjectEvaluationActionsOptions) {
  const queryClient = useQueryClient()

  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: ["infera", "project", "evaluation", tenantId, projectId],
    })

  const invalidateDetail = () => {
    if (!evalRunId) {
      return Promise.resolve()
    }
    return queryClient.invalidateQueries({
      queryKey: getProjectEvaluationDetailQueryKey(tenantId, projectId, evalRunId),
    })
  }

  const createRunMutation = useMutation({
    mutationFn: createEvaluationRun,
    onSuccess: async () => {
      toast.success("评估任务已创建")
      await invalidateList()
      await queryClient.invalidateQueries({
        queryKey: getEvaluationWizardOptionsQueryKey(tenantId, projectId),
      })
    },
  })

  const rerunMutation = useMutation({
    mutationFn: rerunEvaluationRun,
    onSuccess: async () => {
      toast.success("评估已重新运行")
      await invalidateList()
      await invalidateDetail()
    },
  })

  const updateReviewMutation = useMutation({
    mutationFn: updateEvaluationReview,
    onSuccess: async () => {
      toast.success("人工评分已保存")
      await invalidateDetail()
    },
  })

  const promoteMutation = useMutation({
    mutationFn: promoteEvaluationResult,
    onSuccess: async () => {
      toast.success("Promote 证据已记录")
      await invalidateList()
      await invalidateDetail()
    },
  })

  return {
    createRunMutation,
    rerunMutation,
    updateReviewMutation,
    promoteMutation,
  }
}
