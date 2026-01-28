import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { api } from "@/lib/api-client"

/**
 * Check Captcha Request Schema
 */
export const CheckCaptchaRequestSchema = z.object({
	username: z.string().min(1, "Username is required"),
})

export type CheckCaptchaRequest = z.infer<typeof CheckCaptchaRequestSchema>

/**
 * Check Captcha Response Schema
 */
export const CheckCaptchaResponseSchema = z.object({
	required: z.boolean(),
})

export type CheckCaptchaResponse = z.infer<typeof CheckCaptchaResponseSchema>

/**
 * Fetcher - 检查是否需要验证码
 */
const checkCaptcha = async (request: CheckCaptchaRequest): Promise<CheckCaptchaResponse> => {
	const json = await api
		.withAuthClientId()
		.post("nexus-api/iam/login/captcha/check", {
			json: request,
		})
		.json()
	return CheckCaptchaResponseSchema.parse(json) // Runtime Validation
}

/**
 * React Query Mutation Hook - 检查是否需要验证码
 * @example
 * const checkCaptchaMutation = useCheckCaptcha()
 * checkCaptchaMutation.mutate({ username }, {
 *   onSuccess: (data) => {
 *     if (data.needCaptcha) {
 *       // Show captcha input
 *     }
 *   }
 * })
 */
export const useCheckCaptcha = () => {
	return useMutation({
		mutationFn: checkCaptcha,
	})
}
