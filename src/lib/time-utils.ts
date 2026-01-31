import { format, formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

/**
 * 允许的日期格式输入类型（仅限时间戳相关）
 */
export type TimestampInput = number | string | null | undefined

/**
 * 将多种类型的输入解析为 Date 对象（仅支持时间戳）
 */
function timestampToDate(input: TimestampInput): Date | null {
	if (input === null || input === undefined) return null

	let date: Date

	if (typeof input === "number") {
		// 毫秒时间戳
		date = new Date(input)
	} else if (/^\d+$/.test(input)) {
		// 数字字符串时间戳
		date = new Date(Number.parseInt(input, 10))
	} else {
		return null
	}

	return Number.isNaN(date.getTime()) ? null : date
}

/**
 * 格式化为日期：YYYY-MM-DD
 * @example 2026-01-30
 */
export function formatTimestampToDate(input: TimestampInput): string {
	const date = timestampToDate(input)
	if (!date) return "-"
	return format(date, "yyyy-MM-dd")
}

/**
 * 格式化为日期时间：YYYY-MM-DD HH:mm:ss
 * @example 2026-01-30 14:02:32
 */
export function formatTimestampToDateTime(input: TimestampInput): string {
	const date = timestampToDate(input)
	if (!date) return "-"
	return format(date, "yyyy-MM-dd HH:mm:ss")
}

/**
 * 格式化为相对时间（持续时间）
 * @example 刚刚、2分钟前、1天前
 */
export function formatTimestampToRelativeTime(input: TimestampInput): string {
	const date = timestampToDate(input)
	if (!date) return "-"

	const now = new Date()
	const diff = now.getTime() - date.getTime()

	// 如果时间差小于 1 分钟，返回“刚刚”
	if (diff >= 0 && diff < 60000) {
		return "刚刚"
	}

	return formatDistanceToNow(date, {
		addSuffix: true,
		locale: zhCN,
	})
}

/**
 * 导出统一的工具对象方便使用
 */
export const timeUtils = {
	formatTimestampToDate: formatTimestampToDate,
	formatTimestampToDateTime: formatTimestampToDateTime,
	formatTimestampToRelativeTime: formatTimestampToRelativeTime,
}
