import type { ColumnDef } from "@tanstack/react-table"
import { format, formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Activity, ClipboardList, History, Laptop, Monitor, Smartphone } from "lucide-react"
import { parseAsInteger } from "nuqs"
import { useCallback, useMemo, useState } from "react"
import {
	DataTable,
	DataTableContainer,
	DataTableFilterBar,
	DataTablePagination,
	TableProvider,
} from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/ui/date-picker-rac"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserProfile } from "@/features/auth"
import { OperationLogDetailDrawer, PersonalOperationLogTable } from "@/features/operation-log"
import { useDataTable } from "@/hooks"
import { cn } from "@/lib/utils"
import { type Api, fetchCurrentUserLoginLog } from "../api/login-log"

const getDeviceIcon = (device: string) => {
	if (device.includes("iPhone") || device.includes("Android") || device.includes("Mobile")) {
		return <Smartphone className="size-5 text-muted-foreground" />
	}
	if (device.includes("Mac") || device.includes("Windows") || device.includes("Linux")) {
		return <Laptop className="size-5 text-muted-foreground" />
	}
	return <Monitor className="size-5 text-muted-foreground" />
}

export function LogRecordsSettings() {
	const { data: userProfile } = useUserProfile()
	const [activeLogTab, setActiveLogTab] = useState("login")
	const [detailOpen, setDetailOpen] = useState(false)
	const [detailLogId, setDetailLogId] = useState<string | null>(null)

	const loginLogColumns = useMemo<ColumnDef<Api.LoginLog.LoginLogVO>[]>(
		() => [
			{
				accessorKey: "loginTime",
				header: "时间",
				enableSorting: false,
				cell: ({ row }) => {
					const time = row.original.loginTime
					if (!time) return <div className="font-mono text-sm">-</div>
					const date = new Date(Number(time))
					return (
						<div className="flex flex-col gap-0.5">
							<span className="text-sm font-medium">
								{formatDistanceToNow(date, { addSuffix: true, locale: zhCN })}
							</span>
							<span className="text-xs text-muted-foreground font-mono">
								{format(date, "yyyy-MM-dd HH:mm:ss")}
							</span>
						</div>
					)
				},
			},
			{
				accessorKey: "device",
				header: "设备/浏览器",
				enableSorting: false,
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						{getDeviceIcon(row.original.device)}
						<span className="max-w-50 truncate" title={row.original.userAgent}>
							{row.original.device}
						</span>
					</div>
				),
			},
			{
				accessorKey: "loginIp",
				header: "IP / 位置",
				enableSorting: false,
				cell: ({ row }) => (
					<div className="flex flex-col gap-0.5">
						{row.original.loginLocation && (
							<span className="text-sm">{row.original.loginLocation}</span>
						)}
						<span className="font-mono text-xs text-muted-foreground">{row.original.loginIp}</span>
					</div>
				),
			},
			{
				accessorKey: "success",
				header: "状态",
				enableSorting: false,
				cell: ({ row }) => (
					<Badge
						variant={row.original.success === false ? "destructive" : "secondary"}
						className={cn(
							row.original.success !== false &&
								"bg-success-subtle text-success-on-subtle border-success/20 border",
						)}
					>
						{row.original.success === false ? "失败" : "成功"}
					</Badge>
				),
			},
		],
		[],
	)

	const { table, filters, loading, empty, fetching, refetch, pagination, setPage, setPageSize } =
		useDataTable({
			queryKey: ["login-logs"],
			queryFn: (params) => fetchCurrentUserLoginLog(params),
			enableServerSorting: false,
			columns: loginLogColumns,
			filterParsers: {
				loginTimeStart: parseAsInteger,
				loginTimeEnd: parseAsInteger,
			},
		})

	const filterState = filters.state as {
		loginTimeStart?: number | null
		loginTimeEnd?: number | null
	}

	const handleReset = useCallback(() => {
		filters.reset()
	}, [filters])

	const handleRefresh = useCallback(async () => {
		await refetch()
	}, [refetch])

	const hasActiveFilters = useMemo(() => {
		return Boolean(filterState.loginTimeStart || filterState.loginTimeEnd)
	}, [filterState.loginTimeStart, filterState.loginTimeEnd])

	const handleOpenDetail = useCallback((id: string) => {
		setDetailLogId(id)
		setDetailOpen(true)
	}, [])

	const handleDetailOpenChange = useCallback((open: boolean) => {
		setDetailOpen(open)
		if (!open) {
			setDetailLogId(null)
		}
	}, [])

	return (
		<div className="flex-1 flex flex-col min-h-0">
			{/* 移除固定高度，改为自适应以修复滚动条问题 */}
			<Card className="flex flex-col overflow-hidden flex-1 min-h-0">
				<Tabs
					value={activeLogTab}
					onValueChange={setActiveLogTab}
					className="w-full flex-1 flex flex-col min-h-0"
				>
					<CardHeader className="shrink-0">
						<div className="flex flex-col gap-3">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div className="flex items-center gap-2">
									<History className="size-5" />
									<CardTitle>日志记录</CardTitle>
								</div>
								<TabsList variant="line">
									<TabsTrigger value="login" className="gap-1.5">
										<Activity className="size-4" />
										登录日志
									</TabsTrigger>
									<TabsTrigger value="operation" className="gap-1.5">
										<ClipboardList className="size-4" />
										操作日志
									</TabsTrigger>
								</TabsList>
							</div>
							<CardDescription>
								{activeLogTab === "login"
									? "查看你的登录历史记录，包括成功和失败的尝试"
									: "查看当前用户的操作记录与审计详情"}
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="flex-1 flex flex-col min-h-0 p-0">
						<TabsContent value="login" className="mt-0 flex-1 flex flex-col min-h-0 p-6">
							<TableProvider
								table={table}
								loading={loading}
								empty={empty}
								pagination={pagination}
								onPageChange={(page) => setPage(page)}
								onPageSizeChange={(size) => setPageSize(size)}
							>
								<DataTableContainer
									className="flex-1 min-h-0"
									toolbar={
										<DataTableFilterBar
											onReset={handleReset}
											onRefresh={handleRefresh}
											hasActiveFilters={hasActiveFilters}
										>
											<div className="flex items-center gap-2">
												<div className="flex items-center gap-2">
													<DateRangePicker
														value={{
															from: filterState.loginTimeStart
																? new Date(filterState.loginTimeStart)
																: undefined,
															to: filterState.loginTimeEnd
																? new Date(filterState.loginTimeEnd)
																: undefined,
														}}
														onChange={(range: { from: Date; to?: Date } | undefined) => {
															if (range?.from) {
																filters.set("loginTimeStart", range.from.getTime())
															} else {
																filters.set("loginTimeStart", null)
															}

															if (range?.to) {
																const d = new Date(range.to)
																d.setHours(23, 59, 59, 999)
																filters.set("loginTimeEnd", d.getTime())
															} else {
																filters.set("loginTimeEnd", null)
															}
														}}
														placeholder="选择日期范围"
													/>
												</div>
											</div>
										</DataTableFilterBar>
									}
									table={
										<DataTable
											table={table}
											className="flex-1 min-h-0"
											loading={loading}
											empty={empty}
											emptyText="暂无登录日志数据"
											fetching={fetching}
										/>
									}
									pagination={<DataTablePagination />}
								/>
							</TableProvider>
						</TabsContent>
						<TabsContent value="operation" className="mt-0 flex-1 flex flex-col min-h-0 p-6">
							<PersonalOperationLogTable
								userId={userProfile?.userId ?? ""}
								onViewDetail={handleOpenDetail}
								emptyText="暂无操作日志数据"
							/>
						</TabsContent>
					</CardContent>
				</Tabs>
			</Card>
			<OperationLogDetailDrawer
				open={detailOpen}
				logId={detailLogId}
				onOpenChange={handleDetailOpenChange}
			/>
		</div>
	)
}
