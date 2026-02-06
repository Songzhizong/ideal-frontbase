import { type ClassValue, clsx } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"
import type { z } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 使用 Zod Schema 校验数据，并在校验失败时自动弹出 Toast 错误提示
 * @param schema Zod Schema
 * @param data 待校验的数据
 * @returns 校验成功返回解析后的数据，失败返回 null
 */
export function validateWithToast<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): z.infer<T> | null {
  const result = schema.safeParse(data)
  if (!result.success) {
    toast.error(result.error.issues[0]?.message || "验证失败")
    return null
  }
  return result.data
}
