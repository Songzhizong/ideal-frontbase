import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { api } from "@/lib/api-client"

/**
 * Session Schema
 */
export const SessionSchema = z.object({
	id: z.string(),
	loginIp: z.string(),
	location: z.string().optional().nullable(),
	device: z.string(),
	loginChannel: z.string(),
	latestActivity: z.coerce.number(),
	createdTime: z.coerce.number(),
})

export const MySessionSchema = SessionSchema.extend({
	current: z.boolean(),
})

export type Session = z.infer<typeof SessionSchema>
export type MySession = z.infer<typeof MySessionSchema>

/**
 * 获取当前用户的活动会话列表
 */
export const fetchGetMySessions = async (): Promise<MySession[]> => {
	const data = await api.withTenantId().get("nexus-api/iam/me/sessions").json()
	return z.array(MySessionSchema).parse(data)
}

/**
 * 注销指定会话
 */
export const fetchDeleteMySession = async (sessionId: string): Promise<void> => {
	await api.delete(`nexus-api/iam/me/sessions/${sessionId}`)
}

/**
 * Hook - 获取我的会话
 */
export const useMySessions = () => {
	return useQuery({
		queryKey: ["my-sessions"],
		queryFn: fetchGetMySessions,
	})
}

/**
 * Hook - 注销会话
 */
export const useDeleteSession = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: fetchDeleteMySession,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["my-sessions"] })
		},
	})
}
