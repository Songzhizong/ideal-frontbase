import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { api } from "@/lib/api-client"

/**
 * Tenant Info Schema
 * 租户信息
 */
const TenantInfoSchema = z.object({
	id: z.string(), // Long type from backend
	name: z.string(),
	abbreviation: z.string(),
	blocked: z.boolean(),
})

export type TenantInfo = z.infer<typeof TenantInfoSchema>

/**
 * User Profile Schema
 * 用户个人信息
 */
export const UserProfileSchema = z.object({
	userId: z.string(), // Long type from backend
	containerId: z.string().nullable(),
	name: z.string(),
	account: z.string().nullable(),
	phone: z.string().nullable(),
	email: z.string().nullable(),
	mfaEnabled: z.boolean(),
	tenantId: z.string().nullable(),
	tenantName: z.string().nullable(),
	tenantAbbreviation: z.string().nullable(),
	accessibleTenants: z.array(TenantInfoSchema),
})

export type UserProfile = z.infer<typeof UserProfileSchema>

/**
 * Fetcher - 获取当前登录用户个人信息
 */
const getUserProfile = async (): Promise<UserProfile> => {
	const json = await api.get("nexus-api/iam/me/profile").json()
	return UserProfileSchema.parse(json) // Runtime Validation
}

/**
 * React Query Hook - 获取用户个人信息
 * @param options.enabled - 是否启用查询，默认为false，需要手动触发
 * @example
 * const { data, isLoading, refetch } = useUserProfile({ enabled: false })
 * // 手动获取用户信息
 * const handleRefresh = () => refetch()
 */
export const useUserProfile = (options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ["auth", "user-profile"],
		queryFn: getUserProfile,
		staleTime: 60 * 1000, // 1分钟内不重新请求
		retry: false, // 401 时不重试
		enabled: options?.enabled ?? true, // 默认不自动执行
	})
}

/**
 * 手动获取用户信息的函数
 * 可在非React环境中使用
 */
export const fetchUserProfile = getUserProfile
