import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { getCertificate } from "@/features/auth/utils/certificate"
import { api } from "@/lib/api-client"

/**
 * Get Captcha Response Schema
 */
export const GetCaptchaResponseSchema = z.object({
	imageBase64: z.string(),
	provider: z.string(),
})

export type GetCaptchaResponse = z.infer<typeof GetCaptchaResponseSchema>

/**
 * Fetcher - 获取图片验证码
 */
const getCaptcha = async (certificate: string): Promise<GetCaptchaResponse> => {
	const json = await api
		.get("nexus-api/iam/captcha/generate", {
			searchParams: { certificate },
		})
		.json()
	return GetCaptchaResponseSchema.parse(json)
}

/**
 * React Query Hook - 获取图片验证码
 * @example
 * const { data: captcha, refetch } = useGetCaptcha()
 * // Display: <img src={captcha?.imageBase64} alt="captcha" />
 * // Refresh: refetch()
 */
export const useGetCaptcha = () => {
	const certificate = getCertificate()

	return useQuery({
		queryKey: ["captcha", certificate],
		queryFn: () => getCaptcha(certificate),
		enabled: false, // Manual trigger via refetch
		staleTime: 0, // Always fetch fresh captcha
		gcTime: 0, // Don't cache
	})
}
