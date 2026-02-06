import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Save } from "lucide-react"
import { useCallback, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PageContainer } from "@/components/common/page-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useBaseNavigate } from "@/hooks/use-base-navigate"
import { getDemoUserById } from "../demo/users"
import { DEMO_USER_DEPARTMENTS, DEMO_USER_ROLES, DEMO_USER_STATUSES } from "../types"

const ROLE_LABEL: Record<(typeof DEMO_USER_ROLES)[number], string> = {
	super_admin: "超级管理员",
	employee: "普通员工",
	partner: "外部伙伴",
}

const STATUS_LABEL: Record<(typeof DEMO_USER_STATUSES)[number], string> = {
	active: "激活",
	disabled: "禁用",
	locked: "锁定",
}

const UserEditSchema = z.object({
	name: z.string().trim().min(1, "请输入姓名"),
	email: z.string().trim().email("请输入正确的邮箱地址"),
	phone: z
		.string()
		.trim()
		.regex(/^1[3-9]\d{9}$/, "请输入 11 位手机号"),
	role: z.enum(DEMO_USER_ROLES),
	department: z.enum(DEMO_USER_DEPARTMENTS),
	status: z.enum(DEMO_USER_STATUSES),
})

type UserEditValues = z.infer<typeof UserEditSchema>

export function UserEditPage({ userId }: { userId: string }) {
	const navigate = useBaseNavigate()
	const user = useMemo(() => getDemoUserById(userId), [userId])

	const form = useForm<UserEditValues>({
		resolver: zodResolver(UserEditSchema),
		defaultValues: {
			name: user?.name ?? "",
			email: user?.email ?? "",
			phone: user?.phone ?? "",
			role: user?.role ?? "employee",
			department: user?.department ?? "技术部",
			status: user?.status ?? "active",
		},
	})

	useEffect(() => {
		if (!user) return
		form.reset({
			name: user.name,
			email: user.email,
			phone: user.phone,
			role: user.role,
			department: user.department,
			status: user.status,
		})
	}, [form, user])

	const handleBack = useCallback(() => {
		void navigate({ to: "/example/users" })
	}, [navigate])

	const onSubmit = useCallback(
		(values: UserEditValues) => {
			console.log("Update user (static):", { userId, ...values })
			void navigate({ to: "/example/users" })
		},
		[navigate, userId],
	)

	if (!user) {
		return (
			<PageContainer className="flex flex-col gap-6">
				<section className="flex flex-wrap items-center justify-between gap-2">
					<h1 className="text-3xl font-semibold text-foreground">编辑用户</h1>
					<Button type="button" variant="outline" className="gap-2" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4" />
						返回列表
					</Button>
				</section>
				<Card>
					<CardHeader>
						<CardTitle>用户不存在</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">未找到用户：{userId}</CardContent>
				</Card>
			</PageContainer>
		)
	}

	return (
		<PageContainer className="flex flex-col gap-6">
			<section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold text-foreground">编辑用户</h1>
					<p className="text-sm text-muted-foreground">
						静态页面：{user.name}（{user.id}）
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button type="button" variant="outline" className="gap-2" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4" />
						返回列表
					</Button>
					<Button type="submit" form="user-edit-form" className="gap-2">
						<Save className="h-4 w-4" />
						保存
					</Button>
				</div>
			</section>

			<Card>
				<CardHeader>
					<CardTitle>基本信息</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							id="user-edit-form"
							onSubmit={form.handleSubmit(onSubmit)}
							className="grid gap-6 md:grid-cols-2"
						>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>姓名</FormLabel>
										<FormControl>
											<Input placeholder="请输入姓名" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>邮箱</FormLabel>
										<FormControl>
											<Input placeholder="name@company.com" autoComplete="email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>手机号</FormLabel>
										<FormControl>
											<Input placeholder="11 位手机号" inputMode="numeric" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="department"
								render={({ field }) => (
									<FormItem>
										<FormLabel>部门</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="请选择部门" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{DEMO_USER_DEPARTMENTS.map((department) => (
													<SelectItem key={department} value={department}>
														{department}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>角色</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="请选择角色" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{DEMO_USER_ROLES.map((role) => (
													<SelectItem key={role} value={role}>
														{ROLE_LABEL[role]}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>状态</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="请选择状态" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{DEMO_USER_STATUSES.map((status) => (
													<SelectItem key={status} value={status}>
														{STATUS_LABEL[status]}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</CardContent>
			</Card>
		</PageContainer>
	)
}
