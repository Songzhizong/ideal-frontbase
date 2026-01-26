import { addMinutes } from "date-fns"
import { delay, HttpResponse, http } from "msw"
import { DashboardStatsSchema } from "@/features/dashboard/api/get-stats"
import { ProfileSchema, UpdateProfileResponseSchema } from "@/features/dashboard/api/update-profile"
import { env } from "@/lib/env"

const mockStats = DashboardStatsSchema.parse({
	totalUsers: 32480,
	activeToday: 1240,
	conversionRate: 4.6,
	revenue: 128430,
	updatedAt: addMinutes(new Date(), -18).toISOString(),
})

export const handlers = [
	http.get(`${env.VITE_API_BASE_URL}/stats`, async () => {
		await delay(400)
		return HttpResponse.json(mockStats)
	}),
	http.post(`${env.VITE_API_BASE_URL}/profile`, async ({ request }) => {
		const body = await request.json()
		const profile = ProfileSchema.parse(body)

		const response = UpdateProfileResponseSchema.parse({
			...profile,
			updatedAt: new Date().toISOString(),
		})

		return HttpResponse.json(response)
	}),
]
