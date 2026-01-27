/**
 * Theme Preview - Live preview of theme changes
 */

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function ThemePreview() {
	return (
		<Card className="p-4 space-y-3">
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-medium">实时预览</h4>
				<Badge variant="secondary">示例</Badge>
			</div>

			<div className="space-y-2">
				<div className="flex gap-2">
					<Button size="sm" variant="default">
						主要按钮
					</Button>
					<Button size="sm" variant="outline">
						次要按钮
					</Button>
					<Button size="sm" variant="ghost">
						文本按钮
					</Button>
				</div>

				<Input placeholder="输入框示例" className="text-sm" />

				<div className="space-y-1">
					<p className="text-sm" style={{ color: "var(--color-text-primary)" }}>
						主要文本 - 用于标题和重要内容
					</p>
					<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
						次要文本 - 用于描述和辅助信息
					</p>
					<p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
						禁用文本 - 用于不可用状态
					</p>
				</div>

				<div className="flex gap-2">
					<div
						className="flex-1 h-8 rounded flex items-center justify-center text-xs"
						style={{ backgroundColor: "var(--color-success)" }}
					>
						成功
					</div>
					<div
						className="flex-1 h-8 rounded flex items-center justify-center text-xs"
						style={{ backgroundColor: "var(--color-warning)" }}
					>
						警告
					</div>
					<div
						className="flex-1 h-8 rounded flex items-center justify-center text-xs"
						style={{ backgroundColor: "var(--color-error)" }}
					>
						错误
					</div>
					<div
						className="flex-1 h-8 rounded flex items-center justify-center text-xs"
						style={{ backgroundColor: "var(--color-info)" }}
					>
						信息
					</div>
				</div>

				<div
					className="p-3 rounded text-xs"
					style={{
						backgroundColor: "var(--color-bg-elevated)",
						borderColor: "var(--color-border-base)",
						borderWidth: "1px",
					}}
				>
					这是一个浮层容器示例，展示了背景色和边框效果
				</div>
			</div>
		</Card>
	)
}
