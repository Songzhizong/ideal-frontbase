import { z } from "zod"

/**
 * 基础分页 schema (没有内容)
 */
const BasePageInfoSchema = z.object({
	pageNumber: z.number().int(),
	pageSize: z.number().int(),
	totalElements: z.number(),
	totalPages: z.number().int(),
})

/**
 * 通用分页响应模式与后端PageInfo<E>匹配
 * @example
 * ```ts
 * const UserPageSchema = createPageInfoSchema(UserSchema);
 * type UserPage = z.infer<typeof UserPageSchema>;
 * ```
 */
export const createPageInfoSchema = <T extends z.ZodTypeAny>(contentSchema: T) => {
	return BasePageInfoSchema.extend({
		content: z.array(contentSchema),
	})
}

/**
 * PageInfo 的类型辅助工具——从基础模式推断出来
 */
export type PageInfo<T> = z.infer<typeof BasePageInfoSchema> & {
	content: T[]
}

/**
 * 分页请求参数 schema，匹配后端 Paging 类
 */
export const PagingSchema = z.object({
	pageNumber: z.number().int().default(1),
	pageSize: z.number().int().default(20),
})

export type Paging = z.infer<typeof PagingSchema>
