import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api-client"

/** 恢复码: 获取设置状态 */
export async function fetchRecoveryCodeStatus() {
	return api
		.get("nexus-api/iam/factor/recovery-code/status")
		.json<{ exists: boolean; remainingCount: number }>()
}

/** 恢复码: 生成 */
export async function fetchRecoveryCodeGenerate() {
	return api.post("nexus-api/iam/factor/recovery-code/generate").json<string[]>()
}

/** 恢复码: 删除 */
export async function fetchRecoveryCodeDelete() {
	return api.post("nexus-api/iam/factor/recovery-code/delete")
}

/** Hook - 获取恢复码状态 */
export const useRecoveryCodeStatus = () => {
	return useQuery({
		queryKey: ["recovery-code-status"],
		queryFn: fetchRecoveryCodeStatus,
	})
}

/** Hook - 生成恢复码 */
export const useGenerateRecoveryCode = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: fetchRecoveryCodeGenerate,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["recovery-code-status"] })
		},
	})
}

/** Hook - 删除恢复码 */
export const useDeleteRecoveryCode = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: fetchRecoveryCodeDelete,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["recovery-code-status"] })
		},
	})
}
