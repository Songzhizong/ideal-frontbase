import ky, { type KyInstance, type Options } from "ky"
import { toast } from "sonner"
import { env } from "@/lib/env"
import { ProblemDetailSchema } from "@/types/problem-detail"

/**
 * 扩展 Ky 请求配置，支持自定义业务标记
 */
interface ExtendedOptions extends Options {
	useTenantId?: boolean
	useAuthClientId?: boolean
}

// 扩展 KyInstance 类型，添加 withTenantId 和 withAuthClientId 方法
interface ExtendedKyInstance extends KyInstance {
	withTenantId: () => KyInstance
	withAuthClientId: () => KyInstance
}

// Dependency Injection: 定义回调函数类型
type GetTokenFn = () => string | null
type GetTenantIdFn = () => string | null
type OnUnauthorizedFn = () => void

// 初始化为空函数（默认行为）
let getToken: GetTokenFn = () => null
let getTenantId: GetTenantIdFn = () => null
let onUnauthorized: OnUnauthorizedFn = () => {}

/**
 * 配置 API Client 的依赖注入
 * 在应用启动时由 auth feature 调用，注入 token 获取和 401 处理逻辑
 */
export const configureApiClient = (options: {
	getToken: GetTokenFn
	getTenantId: GetTenantIdFn
	onUnauthorized: OnUnauthorizedFn
}) => {
	getToken = options.getToken
	getTenantId = options.getTenantId
	onUnauthorized = options.onUnauthorized
}

const apiInstance = ky.create({
	// 开发环境使用相对路径，通过Vite代理转发
	// 生产环境通过环境变量设置完整URL
	prefixUrl: import.meta.env.DEV ? "/" : env.VITE_API_BASE_URL,
	timeout: 10_000,
	retry: {
		limit: 2,
		methods: ["get"],
		statusCodes: [408, 413, 429, 500, 502, 503, 504],
	},
	hooks: {
		beforeRequest: [
			(request, options) => {
				// 调用动态注入的 token 获取函数
				const token = getToken()
				if (token) {
					request.headers.set("Authorization", token)
				}

				// 处理租户 ID (通过 withTenantId 触发)
				if ((options as ExtendedOptions).useTenantId) {
					const tenantId = getTenantId()
					if (tenantId) {
						console.debug("[API] Setting x-tenant-id:", tenantId)
						request.headers.set("x-tenant-id", tenantId)
					} else {
						console.error("[API] Tenant ID is required but not available.")
					}
				}

				// 处理认证客户端 ID (通过 withAuthClientId 触发)
				if ((options as ExtendedOptions).useAuthClientId) {
					const authClientId = env.VITE_AUTH_CLIENT_ID
					if (authClientId) {
						request.headers.set("x-auth-client-id", authClientId)
					}
				}

				console.info("Request URL:", request.url)

				// 为 GET 请求添加缓存破坏参数
				if (request.method === "GET") {
					const url = new URL(request.url)
					url.searchParams.set("_t", Date.now().toString())
					return new Request(url.toString(), request)
				}
			},
		],
		afterResponse: [
			async (_request, _options, response) => {
				if (!response.ok) {
					if (response.status === 401) {
						// 调用外部注入的 401 处理逻辑
						onUnauthorized()
					} else {
						let message = response.status >= 500 ? "Server error. Try again." : "Request failed."

						try {
							// 尝试解析 RFC 7807 Problem Details
							const data = await response.clone().json()
							const result = ProblemDetailSchema.safeParse(data)
							if (result.success && result.data.detail) {
								message = result.data.detail
							}
						} catch {
							// 解析失败则保留默认错误提示
						}

						toast.error(message)
					}
				}
				return response
			},
		],
	},
})

/**
 * 扩展 API 实例，添加携带租户ID和认证客户端ID的方法
 * 使用方式:
 * - api.withTenantId().get("users")
 * - api.withAuthClientId().post("auth/login")
 */
;(apiInstance as ExtendedKyInstance).withTenantId = function () {
	return this.extend({
		useTenantId: true,
	} as ExtendedOptions)
}

;(apiInstance as ExtendedKyInstance).withAuthClientId = function () {
	return this.extend({
		useAuthClientId: true,
	} as ExtendedOptions)
}

// 导出带类型的 api 实例
export const api = apiInstance as ExtendedKyInstance
