import { subMinutes } from "date-fns"
import { delay, HttpResponse, http } from "msw"
import { mockRegistry } from "@/mocks/registry"
import { Api } from "./operation-log"

// 模拟动作配置
const ACTION_CONFIGS = [
	{
		name: "用户登录",
		type: Api.ActionType.READ,
		module: "认证中心",
		resource: "USER",
		sensitive: false,
	},
	{
		name: "导出用户列表",
		type: Api.ActionType.EXPORT,
		module: "用户管理",
		resource: "USER",
		sensitive: true,
	},
	{
		name: "创建新用户",
		type: Api.ActionType.ADD,
		module: "用户管理",
		resource: "USER",
		sensitive: false,
	},
	{
		name: "修改用户角色",
		type: Api.ActionType.UPDATE,
		module: "用户管理",
		resource: "USER_ROLE",
		sensitive: false,
	},
	{
		name: "删除系统日志",
		type: Api.ActionType.DELETE,
		module: "系统运维",
		resource: "LOG",
		sensitive: true,
	},
	{
		name: "分配部门权限",
		type: Api.ActionType.ASSIGN,
		module: "权限控制",
		resource: "PERMISSION",
		sensitive: false,
	},
	{
		name: "上传合同文件",
		type: Api.ActionType.UPLOAD,
		module: "文件管理",
		resource: "FILE",
		sensitive: false,
	},
	{
		name: "下载敏感报表",
		type: Api.ActionType.DOWNLOAD,
		module: "财务系统",
		resource: "REPORT",
		sensitive: true,
	},
	{
		name: "更新系统配置",
		type: Api.ActionType.UPDATE,
		module: "系统设置",
		resource: "CONFIG",
		sensitive: true,
	},
	{
		name: "重置用户密码",
		type: Api.ActionType.UPDATE,
		module: "用户管理",
		resource: "USER",
		sensitive: true,
	},
]

const USERS = [
	{ id: "u-001", account: "admin", name: "系统管理员" },
	{ id: "u-002", account: "zhangsan", name: "张三" },
	{ id: "u-003", account: "lisi", name: "李四" },
	{ id: "u-004", account: "wangwu", name: "王五" },
	{ id: "u-005", account: "zhaoliu", name: "赵六" },
]

const IPS = ["192.168.1.100", "112.54.32.11", "221.7.18.52", "10.0.4.15", "183.15.92.101"]
const LOCATIONS = ["北京市", "上海市", "深圳市", "成都市", "杭州市"]

// 生成 100 条模拟数据
const allMockLogs: Api.OperationLog.SimpleLog[] = Array.from({ length: 100 }).map((_, index) => {
	const config = ACTION_CONFIGS[index % ACTION_CONFIGS.length]
	const user = USERS[index % USERS.length]

	if (!config || !user) {
		throw new Error("Mock config or user not found")
	}

	const isSuccess = Math.random() > 0.1 // 90% 成功率
	const id = `log-${index + 1000}`
	const operationTime = subMinutes(
		new Date(),
		index * 15 + Math.floor(Math.random() * 10),
	).getTime()

	return {
		id,
		system: "IDEAL_TEMPLATE",
		moduleCode: config.module,
		moduleName: config.module,
		actionName: config.name,
		actionType: config.type,
		sensitive: config.sensitive,
		userId: user.id,
		userDisplayName: user.name,
		userAccount: user.account,
		tenantId: "t-001",
		traceId: `trace-${Math.random().toString(36).substring(2, 10)}`,
		containerId: null,
		originalContainerId: null,
		resourceType: config.resource,
		resourceId: `res-${1000 + index}`,
		resourceName: `${config.resource}_ITEM_${index}`,
		originalResourceName: null,
		resourceTenantId: null,
		httpMethod: index % 2 === 0 ? "POST" : "GET",
		path: `/api/v1/${config.resource.toLowerCase()}`,
		clientIp: IPS[index % IPS.length] ?? null,
		clientLocation: LOCATIONS[index % LOCATIONS.length] ?? null,
		success: isSuccess,
		duration: Math.floor(Math.random() * 500) + 50,
		operationTime,
	}
})

// 为每条日志生成详详情模型
const logDetails: Record<string, Api.OperationLog.DetailLog> = {}

for (const log of allMockLogs) {
	let modification: Api.ModifiedFields | null = null

	if (log.actionType === Api.ActionType.UPDATE) {
		const fields: Api.ModifiedField[] = []
		if (log.resourceType === "USER") {
			fields.push(
				{
					type: "string",
					ident: "displayName",
					value: "张三",
					displayValue: "张三",
					modifiedValue: "张小三",
					displayModifiedValue: "张小三",
				},
				{
					type: "enum",
					ident: "status",
					value: "INACTIVE",
					displayValue: "禁用",
					modifiedValue: "ACTIVE",
					displayModifiedValue: "启用",
				},
			)
		} else if (log.resourceType === "CONFIG") {
			fields.push({
				type: "string",
				ident: "system.timeout",
				value: "3000",
				displayValue: "3000ms",
				modifiedValue: "5000",
				displayModifiedValue: "5000ms",
			})
		} else {
			fields.push({
				type: "string",
				ident: "name",
				value: "旧数据",
				modifiedValue: "新数据",
			})
		}
		modification = {
			modifiedFields: fields,
		}
	}

	logDetails[log.id] = {
		...log,
		remark: log.success
			? `成功执行${log.actionName}操作`
			: `执行${log.actionName}失败：${log.sensitive ? "权限受限" : "系统繁忙"}`,
		userAgent:
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
		modification,
		schema: null,
		extra: null,
		errorMessage: log.success
			? null
			: "Error Code: ERR_0403. Message: Access denied for the requested resource.",
		resourceSnapshot: null,
		modifiedResourceSnapshot: null,
		request: {
			headers: { "Content-Type": "application/json", "X-Request-ID": log.traceId },
			body: { id: log.resourceId, type: log.resourceType, timestamp: log.operationTime },
		},
		response: log.success
			? { code: 0, message: "success", data: { id: log.resourceId, status: "processed" } }
			: { code: 403, message: "Forbidden", error: "Permission denied" },
	}
}

export const operationLogHandlers = [
	// 获取日志列表
	http.get("*/nexus-api/audit/tenant/logs", async ({ request }) => {
		await delay(500)
		const url = new URL(request.url)

		const pageNumber = Number.parseInt(url.searchParams.get("pageNumber") || "1", 10)
		const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "10", 10)
		const userId = url.searchParams.get("userId")
		const actionType = url.searchParams.get("actionType")
		const success = url.searchParams.get("success")
		const sensitive = url.searchParams.get("sensitive")
		const startTimeMs = url.searchParams.get("startTimeMs")
		const endTimeMs = url.searchParams.get("endTimeMs")

		let filtered = [...allMockLogs]

		if (userId) {
			filtered = filtered.filter((l) => l.userId === userId)
		}
		if (actionType) {
			filtered = filtered.filter((l) => l.actionType === actionType)
		}
		if (success) {
			filtered = filtered.filter((l) => String(l.success) === success)
		}
		if (sensitive) {
			filtered = filtered.filter((l) => String(l.sensitive) === sensitive)
		}
		if (startTimeMs) {
			filtered = filtered.filter((l) => Number(l.operationTime) >= Number(startTimeMs))
		}
		if (endTimeMs) {
			filtered = filtered.filter((l) => Number(l.operationTime) <= Number(endTimeMs))
		}

		// 按时间倒序排序
		filtered.sort((a, b) => Number(b.operationTime) - Number(a.operationTime))

		const totalElements = filtered.length
		const totalPages = Math.ceil(totalElements / pageSize)
		const content = filtered.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)

		return HttpResponse.json({
			content,
			pageNumber,
			pageSize,
			totalElements,
			totalPages,
		})
	}),

	// 获取日志详情
	http.get("*/nexus-api/audit/tenant/logs/:id/detail", async ({ params }) => {
		await delay(300)
		const { id } = params
		const detail = logDetails[id as string]

		if (!detail) {
			return new HttpResponse(null, { status: 404 })
		}

		return HttpResponse.json(detail)
	}),
]

// 注册
mockRegistry.register(...operationLogHandlers)
