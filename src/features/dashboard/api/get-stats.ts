import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { api } from "@/lib/api-client"

export const DashboardStatsSchema = z.object({
	totalUsers: z.number().int().nonnegative(),
	activeToday: z.number().int().nonnegative(),
	conversionRate: z.number().min(0).max(100),
	revenue: z.number().nonnegative(),
	updatedAt: z.string().datetime(),
})

export type DashboardStats = z.infer<typeof DashboardStatsSchema>

const getStats = async () => {
	const json = await api.get("stats").json()
	return DashboardStatsSchema.parse(json)
}

export function useDashboardStats() {
	return useQuery({
		queryKey: ["dashboard", "stats"],
		queryFn: getStats,
	})
}
