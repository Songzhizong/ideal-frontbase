import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { api } from "@/lib/api-client"

// ============================================================================
// Schemas & Types
// ============================================================================

/**
 * Token Schema - 访问令牌信息
 */
export const VisibleTokenSchema = z.object({
	token_type: z.string(),
	access_token: z.string(),
})

export type VisibleToken = z.infer<typeof VisibleTokenSchema>

/**
 * Factor Type Enum - 多因素认证方式
 */
export enum FactorType {
	TOTP = "TOTP", // 手机令牌(One-Time Password)
	SMS = "SMS", // 短信验证码
	EMAIL = "EMAIL", // 邮件验证码
	RECOVERY_CODE = "RECOVERY_CODE", // 一次性恢复码
}

/**
 * MFA Ticket Schema - 多因素认证票据
 */
export const MfaTicketSchema = z.object({
	ticket: z.string(),
	methods: z.array(z.enum(FactorType)),
})

export type MfaTicket = z.infer<typeof MfaTicketSchema>

/**
 * Change Password Ticket Schema - 修改密码票据
 */
export const ChangePasswordTicketSchema = z.object({
	ticket: z.string(),
	userId: z.string(), // Long 类型使用字符串接收
})

export type ChangePasswordTicket = z.infer<typeof ChangePasswordTicketSchema>

/**
 * Selectable Account Schema - 可选择的账号
 */
export const SelectableAccountSchema = z.object({
	uid: z.string(), // Long 类型使用字符串接收
	account: z.string(),
	phone: z.string(),
	email: z.string(),
	registrationTime: z.number(),
	lastActiveTime: z.number().nullable(),
	blocked: z.boolean(),
	accountExpired: z.boolean(),
})

export type SelectableAccount = z.infer<typeof SelectableAccountSchema>

/**
 * Select Account Ticket Schema - 选择账号票据
 */
export const SelectAccountTicketSchema = z.object({
	ticket: z.string(),
	accounts: z.array(SelectableAccountSchema),
})

export type SelectAccountTicket = z.infer<typeof SelectAccountTicketSchema>

/**
 * Login Response Type Enum
 */
export enum LoginResponseType {
	TOKEN = "TOKEN", // 成功执行登录
	NEED_MFA = "NEED_MFA", // 需要多因素认证
	SELECT_ACCOUNT = "SELECT_ACCOUNT", // 需要选择账号
	PASSWORD_EXPIRED = "PASSWORD_EXPIRED", // 密码已过期
	PASSWORD_ILLEGAL = "PASSWORD_ILLEGAL", // 密码不合规
}

/**
 * Login Response Schema - 登录响应
 */
export const LoginResponseSchema = z.object({
	type: z.nativeEnum(LoginResponseType),
	token: VisibleTokenSchema.optional(),
	mfaTicket: MfaTicketSchema.optional(),
	passwordTicket: ChangePasswordTicketSchema.optional(),
	selectAccountTicket: SelectAccountTicketSchema.optional(),
})

export type LoginResponse = z.infer<typeof LoginResponseSchema>

// ============================================================================
// 1. Password Login - 密码登录
// ============================================================================

export const PasswordLoginRequestSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	certificate: z.string(),
	captcha: z.string().optional(), // JSON string: {"captchaCode":"lJfY"}
})

export type PasswordLoginRequest = z.infer<typeof PasswordLoginRequestSchema>

const passwordLogin = async (credentials: PasswordLoginRequest): Promise<LoginResponse> => {
	const json = await api
		.withAuthClientId()
		.post("nexus-api/iam/login/password", {
			json: credentials,
		})
		.json()
	return LoginResponseSchema.parse(json)
}

/**
 * Hook - 密码登录
 * @example
 * const loginMutation = usePasswordLogin(clientId)
 * loginMutation.mutate({
 *   username: "user@example.com",
 *   password: "password123",
 *   certificate: getCertificate(),
 *   captcha: JSON.stringify({ captchaCode: "lJfY" })
 * })
 */
export const usePasswordLogin = () => {
	return useMutation({
		mutationFn: (credentials: PasswordLoginRequest) => passwordLogin(credentials),
	})
}

// ============================================================================
// 2. Send SMS Login Code - 发送短信登录验证码
// ============================================================================

export const SendSmsCodeRequestSchema = z.object({
	phone: z.string().min(1, "Phone number is required"),
	certificate: z.string(),
	captcha: z.string(), // JSON string: {"captchaCode":"riMW"}
})

export type SendSmsCodeRequest = z.infer<typeof SendSmsCodeRequestSchema>

const sendSmsLoginCode = async (request: SendSmsCodeRequest): Promise<void> => {
	await api
		.withAuthClientId()
		.post("nexus-api/iam/login/sms-code/send", {
			json: request,
		})
		.json()
}

/**
 * Hook - 发送短信登录验证码
 * @example
 * const sendCodeMutation = useSendSmsLoginCode(clientId)
 * sendCodeMutation.mutate({
 *   phone: "18256928780",
 *   certificate: getCertificate(),
 *   captcha: JSON.stringify({ captchaCode: "riMW" })
 * })
 */
export const useSendSmsLoginCode = () => {
	return useMutation({
		mutationFn: (request: SendSmsCodeRequest) => sendSmsLoginCode(request),
	})
}

// ============================================================================
// 3. SMS Code Login - 短信验证码登录
// ============================================================================

export const SmsCodeLoginRequestSchema = z.object({
	phone: z.string().min(1, "Phone number is required"),
	code: z.string().min(1, "Verification code is required"),
})

export type SmsCodeLoginRequest = z.infer<typeof SmsCodeLoginRequestSchema>

const smsCodeLogin = async (request: SmsCodeLoginRequest): Promise<LoginResponse> => {
	const json = await api
		.withAuthClientId()
		.post("nexus-api/iam/login/sms-code", {
			json: request,
		})
		.json()
	return LoginResponseSchema.parse(json)
}

/**
 * Hook - 短信验证码登录
 * @example
 * const smsLoginMutation = useSmsCodeLogin(clientId)
 * smsLoginMutation.mutate({
 *   phone: "18256928780",
 *   code: "105742"
 * })
 */
export const useSmsCodeLogin = () => {
	return useMutation({
		mutationFn: (request: SmsCodeLoginRequest) => smsCodeLogin(request),
	})
}

// ============================================================================
// 4. Select Account - 选择登录账号
// ============================================================================

export const SelectAccountRequestSchema = z.object({
	uid: z.string(), // Long 类型使用字符串接收
	ticket: z.string(),
})

export type SelectAccountRequest = z.infer<typeof SelectAccountRequestSchema>

const selectAccount = async (request: SelectAccountRequest): Promise<LoginResponse> => {
	const json = await api
		.post("nexus-api/iam/login/select-account", {
			json: request,
		})
		.json()
	return LoginResponseSchema.parse(json)
}

/**
 * Hook - 选择登录账号
 * 当登录接口返回 SELECT_ACCOUNT 类型时使用
 * @example
 * const selectMutation = useSelectAccount()
 * selectMutation.mutate({
 *   uid: 634213639955415040,
 *   ticket: selectAccountTicket.ticket
 * })
 */
export const useSelectAccount = () => {
	return useMutation({
		mutationFn: selectAccount,
	})
}

// ============================================================================
// 5. Send MFA SMS Code - 发送多因素认证短信验证码
// ============================================================================

export const SendMfaSmsCodeRequestSchema = z.object({
	ticket: z.string(),
})

export type SendMfaSmsCodeRequest = z.infer<typeof SendMfaSmsCodeRequestSchema>

const sendMfaSmsCode = async (ticket: string): Promise<void> => {
	await api
		.post("nexus-api/iam/login/multifactor/send-sms-code", {
			body: new URLSearchParams({ ticket }),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
		.json()
}

/**
 * Hook - 发送多因素认证短信验证码
 * @example
 * const sendMfaSmsMutation = useSendMfaSmsCode()
 * sendMfaSmsMutation.mutate(mfaTicket.ticket)
 */
export const useSendMfaSmsCode = () => {
	return useMutation({
		mutationFn: sendMfaSmsCode,
	})
}

// ============================================================================
// 6. Send MFA Email Code - 发送多因素认证邮件验证码
// ============================================================================

const sendMfaEmailCode = async (ticket: string): Promise<void> => {
	await api
		.post("nexus-api/iam/login/multifactor/send-email-code", {
			body: new URLSearchParams({ ticket }),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
		.json()
}

/**
 * Hook - 发送多因素认证邮件验证码
 * @example
 * const sendMfaEmailMutation = useSendMfaEmailCode()
 * sendMfaEmailMutation.mutate(mfaTicket.ticket)
 */
export const useSendMfaEmailCode = () => {
	return useMutation({
		mutationFn: sendMfaEmailCode,
	})
}

// ============================================================================
// 7. Multifactor Login - 多因素登录
// ============================================================================

export const MultifactorLoginRequestSchema = z.object({
	ticket: z.string(),
	method: z.nativeEnum(FactorType),
	code: z.string().min(1, "Verification code is required"),
})

export type MultifactorLoginRequest = z.infer<typeof MultifactorLoginRequestSchema>

const multifactorLogin = async (request: MultifactorLoginRequest): Promise<LoginResponse> => {
	const json = await api
		.post("nexus-api/iam/login/multifactor", {
			json: request,
		})
		.json()
	return LoginResponseSchema.parse(json)
}

/**
 * Hook - 多因素登录
 * 当登录接口返回 NEED_MFA 类型时使用
 * @example
 * const mfaMutation = useMultifactorLogin()
 * mfaMutation.mutate({
 *   ticket: mfaTicket.ticket,
 *   method: FactorType.SMS,
 *   code: "108176"
 * })
 */
export const useMultifactorLogin = () => {
	return useMutation({
		mutationFn: multifactorLogin,
	})
}

// ============================================================================
// 8. Change Password and Login - 修改密码并登录
// ============================================================================

export const ChangePasswordLoginRequestSchema = z.object({
	ticket: z.string(),
	newPassword: z.string().min(6, "Password must be at least 6 characters"),
})

export type ChangePasswordLoginRequest = z.infer<typeof ChangePasswordLoginRequestSchema>

const changePasswordLogin = async (request: ChangePasswordLoginRequest): Promise<LoginResponse> => {
	const json = await api
		.post("nexus-api/iam/login/change-password", {
			json: request,
		})
		.json()
	return LoginResponseSchema.parse(json)
}

/**
 * Hook - 修改密码并登录
 * 当登录接口返回 PASSWORD_EXPIRED 或 PASSWORD_ILLEGAL 类型时使用
 * @example
 * const changePasswordMutation = useChangePasswordLogin()
 * changePasswordMutation.mutate({
 *   ticket: passwordTicket.ticket,
 *   newPassword: "newPassword123"
 * })
 */
export const useChangePasswordLogin = () => {
	return useMutation({
		mutationFn: changePasswordLogin,
	})
}
