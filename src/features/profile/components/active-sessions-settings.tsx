import { Activity, Clock, Laptop, LogOut, MapPin, Monitor, Smartphone } from "lucide-react"
import { toast } from "sonner"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useDeleteSession, useMySessions } from "../api/session"

const getDeviceIcon = (device: string) => {
	if (device.includes("iPhone") || device.includes("Android") || device.includes("Mobile")) {
		return <Smartphone className="size-5 text-muted-foreground" />
	}
	if (device.includes("Mac") || device.includes("Windows") || device.includes("Linux")) {
		return <Laptop className="size-5 text-muted-foreground" />
	}
	return <Monitor className="size-5 text-muted-foreground" />
}

export function ActiveSessionsSettings() {
	const { data: sessions = [], isLoading } = useMySessions()
	const sortedSessions = [...sessions].sort((a, b) =>
		a.current === b.current ? 0 : a.current ? -1 : 1,
	)
	const deleteSession = useDeleteSession()

	const handleRevokeSession = async (sessionId: string) => {
		try {
			await deleteSession.mutateAsync(sessionId)
			toast.success("会话已注销")
		} catch (error) {
			console.error("Failed to revoke session:", error)
		}
	}

	const handleRevokeAllSessions = async () => {
		const otherSessions = sessions.filter((s) => !s.current)
		if (otherSessions.length === 0) {
			toast.info("没有其他可注销的会话")
			return
		}

		const promise = Promise.all(otherSessions.map((s) => deleteSession.mutateAsync(s.id)))

		toast.promise(promise, {
			loading: "正在注销所有其他会话...",
			success: "所有其他会话已注销",
			error: "部分会话注销失败",
		})
	}

	const formatDate = (timestamp: number | string | undefined) => {
		if (!timestamp) return "未知"
		const date = new Date(Number(timestamp))
		if (Number.isNaN(date.getTime())) return "未知"
		return date.toLocaleString()
	}

	return (
		<div className="flex-1 flex flex-col min-h-0">
			<Card className="flex flex-col flex-1 min-h-0 overflow-hidden">
				<CardHeader className="shrink-0">
					<div className="flex items-center justify-between">
						<div>
							<div className="flex items-center gap-2">
								<Activity className="size-5" />
								<CardTitle>活跃会话</CardTitle>
							</div>
							<CardDescription className="mt-1.5">管理你在不同设备上的登录会话</CardDescription>
						</div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									disabled={isLoading || sessions.filter((s) => !s.current).length === 0}
								>
									<LogOut className="mr-2 size-4" />
									注销所有其他会话
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>注销所有其他会话</AlertDialogTitle>
									<AlertDialogDescription>
										这将注销除当前设备外的所有会话。你需要在这些设备上重新登录。
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>取消</AlertDialogCancel>
									<AlertDialogAction onClick={handleRevokeAllSessions}>确认注销</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</CardHeader>
				<CardContent className="flex-1 min-h-0 overflow-y-auto">
					<div className="space-y-4">
						{isLoading ? (
							<div className="flex h-32 items-center justify-center text-muted-foreground">
								正在加载会话...
							</div>
						) : sessions.length === 0 ? (
							<div className="flex h-32 items-center justify-center text-muted-foreground">
								暂无活跃会话
							</div>
						) : (
							sortedSessions.map((session) => (
								<div
									key={session.id}
									className={cn(
										"flex items-start justify-between rounded-lg border border-border/50 p-4 transition-all relative overflow-hidden",
										session.current &&
											"bg-primary/3 border-primary/20 dark:bg-primary/5 dark:border-primary/30 shadow-sm",
									)}
								>
									{session.current && (
										<div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80" />
									)}
									<div className="flex gap-4">
										<div className="mt-1">{getDeviceIcon(session.device)}</div>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{session.device}</h4>
												{session.current && (
													<Badge variant="default" className="text-xs">
														当前设备
													</Badge>
												)}
											</div>
											<div className="flex flex-col gap-1 text-sm text-muted-foreground">
												<div className="flex items-center gap-1.5">
													<Monitor className="size-3.5" />
													<span>{session.device}</span>
												</div>
												<div className="flex items-center gap-1.5">
													<MapPin className="size-3.5" />
													<span>
														{session.loginIp} · {session.location || "未知位置"}
													</span>
												</div>
												<div className="flex items-center gap-1.5">
													<Clock className="size-3.5" />
													<span>
														最后活跃: {formatDate(session.latestActivity || session.createdTime)}
													</span>
												</div>
											</div>
										</div>
									</div>
									{!session.current && (
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button variant="ghost" size="sm" disabled={deleteSession.isPending}>
													注销
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>注销会话</AlertDialogTitle>
													<AlertDialogDescription>
														确定要注销 "{session.device}" 上的会话吗？
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>取消</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleRevokeSession(session.id)}
														disabled={deleteSession.isPending}
													>
														确认注销
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									)}
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
