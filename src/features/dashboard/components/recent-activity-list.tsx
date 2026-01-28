import { Bell, CheckCircle, FileText, LogIn, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RecentActivity } from "@/features/dashboard"
import { cn } from "@/lib/utils"

interface RecentActivityListProps {
	activities: RecentActivity[]
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
	const getActivityIcon = (type: RecentActivity["type"]) => {
		switch (type) {
			case "login":
				return LogIn
			case "file_upload":
				return FileText
			case "task_complete":
				return CheckCircle
			case "notification":
				return Bell
			case "system":
				return Settings
			default:
				return Settings
		}
	}

	const getActivityColor = (type: RecentActivity["type"]) => {
		switch (type) {
			case "login":
				return "text-info bg-info-subtle"
			case "file_upload":
				return "text-success bg-success-subtle"
			case "task_complete":
				return "text-primary bg-primary/10"
			case "notification":
				return "text-warning bg-warning-subtle"
			case "system":
				return "text-muted-foreground bg-muted"
			default:
				return "text-muted-foreground bg-muted"
		}
	}

	const getTypeText = (type: RecentActivity["type"]) => {
		switch (type) {
			case "login":
				return "登录"
			case "file_upload":
				return "文件"
			case "task_complete":
				return "任务"
			case "notification":
				return "通知"
			case "system":
				return "系统"
			default:
				return "其他"
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>最近活动</CardTitle>
				<CardDescription>系统最新的操作记录和活动日志</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{activities.map((activity) => {
						const Icon = getActivityIcon(activity.type)
						return (
							<div key={activity.id} className="flex items-start gap-3 pb-3 last:pb-0">
								<div className={cn("rounded-full p-2", getActivityColor(activity.type))}>
									<Icon className="h-4 w-4" />
								</div>
								<div className="flex-1 space-y-1">
									<div className="flex items-center gap-2">
										<p className="text-sm font-medium text-foreground">{activity.description}</p>
										<Badge variant="secondary" className="text-xs">
											{getTypeText(activity.type)}
										</Badge>
									</div>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<span>{activity.user}</span>
										<span>•</span>
										<span>{new Date(activity.timestamp).toLocaleString("zh-CN")}</span>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</CardContent>
		</Card>
	)
}
