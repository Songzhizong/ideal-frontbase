import { z } from "zod"

export const InfrastructureStatsSchema = z.object({
	totalUsers: z.number(),
	activeUsers: z.number(),
	totalFiles: z.number(),
	storageUsed: z.string(),
	totalTasks: z.number(),
	runningTasks: z.number(),
	totalNotifications: z.number(),
	unreadNotifications: z.number(),
	systemHealth: z.enum(["healthy", "warning", "error"]),
	updatedAt: z.string(),
})

export type InfrastructureStats = z.infer<typeof InfrastructureStatsSchema>

export const SystemModuleSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	status: z.enum(["active", "inactive", "maintenance"]),
	usage: z.number(),
	lastUpdated: z.string(),
})

export type SystemModule = z.infer<typeof SystemModuleSchema>

export const RecentActivitySchema = z.object({
	id: z.string(),
	type: z.enum(["login", "file_upload", "task_complete", "notification", "system"]),
	user: z.string(),
	description: z.string(),
	timestamp: z.string(),
})

export type RecentActivity = z.infer<typeof RecentActivitySchema>
