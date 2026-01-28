import { z } from "zod"

/**
 * Permission Schema - 权限定义
 * 可以是字符串（如 "user:read"）或对象（包含资源和操作）
 */
export const PermissionSchema = z.string()

/**
 * User Schema - 当前登录用户信息
 */
export const UserSchema = z.object({
	id: z.string(),
	email: z.email(),
	name: z.string(),
	avatar: z.url().optional(),
	role: z.string(), // 如 "admin", "user", "guest"
})

/**
 * Auth Response Schema - 登录接口返回
 */
export const AuthResponseSchema = z.object({
	token: z.string(),
	user: UserSchema,
	permissions: z.array(PermissionSchema),
})

// Type Inference
export type Permission = z.infer<typeof PermissionSchema>
export type User = z.infer<typeof UserSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
