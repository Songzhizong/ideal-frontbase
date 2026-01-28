import { Badge } from "@/components/ui/badge"

export function BadgeTest() {
	return (
		<div className="p-8 space-y-6">
			<h2 className="text-2xl font-bold">Badge 组件测试</h2>
			
			<div className="space-y-4">
				<div>
					<h3 className="text-lg font-semibold mb-2">默认变体</h3>
					<div className="flex gap-2">
						<Badge>Default</Badge>
						<Badge variant="secondary">Secondary</Badge>
						<Badge variant="destructive">Destructive</Badge>
						<Badge variant="outline">Outline</Badge>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-2">语义色变体 (Subtle)</h3>
					<div className="flex gap-2">
						<Badge variant="success">成功</Badge>
						<Badge variant="warning">警告</Badge>
						<Badge variant="error">错误</Badge>
						<Badge variant="info">信息</Badge>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-2">语义色变体 (Solid)</h3>
					<div className="flex gap-2">
						<Badge variant="success-solid">成功</Badge>
						<Badge variant="warning-solid">警告</Badge>
						<Badge variant="error-solid">错误</Badge>
						<Badge variant="info-solid">信息</Badge>
					</div>
				</div>
			</div>
		</div>
	)
}