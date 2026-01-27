/**
 * Theme Showcase - Comprehensive example of theme system usage
 */

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useThemeStore } from "@/hooks/use-theme-store"

export function ThemeShowcase() {
	const { getActivePreset, getEffectiveMode } = useThemeStore()
	const preset = getActivePreset()
	const mode = getEffectiveMode()

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold mb-2">主题系统展示</h1>
				<p className="text-muted-foreground">
					当前主题：{preset?.name} | 模式：{mode === "light" ? "浅色" : "深色"}
				</p>
			</div>

			{/* Color Palette */}
			<Card className="p-6">
				<h2 className="text-xl font-semibold mb-4">颜色调色板</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Brand Colors */}
					<div className="space-y-2">
						<h3 className="text-sm font-medium text-muted-foreground">品牌色</h3>
						<div
							className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
							style={{ backgroundColor: "var(--color-primary)" }}
						>
							Primary
						</div>
						<div
							className="h-12 rounded flex items-center justify-center text-white text-sm"
							style={{ backgroundColor: "var(--color-primary-hover)" }}
						>
							Hover
						</div>
						<div
							className="h-12 rounded flex items-center justify-center text-white text-sm"
							style={{ backgroundColor: "var(--color-primary-active)" }}
						>
							Active
						</div>
					</div>

					{/* Functional Colors */}
					<div className="space-y-2">
						<h3 className="text-sm font-medium text-muted-foreground">功能色</h3>
						<div
							className="h-12 rounded flex items-center justify-center text-white text-sm"
							style={{ backgroundColor: "var(--color-success)" }}
						>
							Success
						</div>
						<div
							className="h-12 rounded flex items-center justify-center text-white text-sm"
							style={{ backgroundColor: "var(--color-warning)" }}
						>
							Warning
						</div>
						<div
							className="h-12 rounded flex items-center justify-center text-white text-sm"
							style={{ backgroundColor: "var(--color-error)" }}
						>
							Error
						</div>
						<div
							className="h-12 rounded flex items-center justify-center text-white text-sm"
							style={{ backgroundColor: "var(--color-info)" }}
						>
							Info
						</div>
					</div>

					{/* Text Colors */}
					<div className="space-y-2">
						<h3 className="text-sm font-medium text-muted-foreground">文本色</h3>
						<div className="p-3 rounded border" style={{ borderColor: "var(--color-border-base)" }}>
							<p className="text-sm" style={{ color: "var(--color-text-primary)" }}>
								主要文本
							</p>
							<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
								次要文本
							</p>
							<p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
								禁用文本
							</p>
							<a href="#a" className="text-sm" style={{ color: "var(--color-text-link)" }}>
								链接文本
							</a>
						</div>
					</div>

					{/* Background Colors */}
					<div className="space-y-2">
						<h3 className="text-sm font-medium text-muted-foreground">背景色</h3>
						<div
							className="h-12 rounded flex items-center justify-center text-sm border"
							style={{
								backgroundColor: "var(--color-bg-canvas)",
								borderColor: "var(--color-border-base)",
							}}
						>
							Canvas
						</div>
						<div
							className="h-12 rounded flex items-center justify-center text-sm border"
							style={{
								backgroundColor: "var(--color-bg-container)",
								borderColor: "var(--color-border-base)",
							}}
						>
							Container
						</div>
						<div
							className="h-12 rounded flex items-center justify-center text-sm border"
							style={{
								backgroundColor: "var(--color-bg-elevated)",
								borderColor: "var(--color-border-base)",
							}}
						>
							Elevated
						</div>
					</div>
				</div>
			</Card>

			{/* Components */}
			<Card className="p-6">
				<h2 className="text-xl font-semibold mb-4">组件示例</h2>
				<div className="space-y-6">
					{/* Buttons */}
					<div className="space-y-2">
						<h3 className="text-sm font-medium">按钮</h3>
						<div className="flex flex-wrap gap-2">
							<Button variant="default">Default</Button>
							<Button variant="outline">Outline</Button>
							<Button variant="ghost">Ghost</Button>
						</div>
					</div>

					{/* Badges */}
					<div className="space-y-2">
						<h3 className="text-sm font-medium">徽章</h3>
						<div className="flex flex-wrap gap-2">
							<Badge variant="default">Default</Badge>
							<Badge variant="secondary">Secondary</Badge>
							<Badge variant="outline">Outline</Badge>
							<Badge variant="destructive">Destructive</Badge>
						</div>
					</div>

					{/* Form Elements */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium">表单元素</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="input-example">输入框</Label>
								<Input id="input-example" placeholder="请输入内容..." />
							</div>
							<div className="space-y-2">
								<Label htmlFor="textarea-example">文本域</Label>
								<Textarea id="textarea-example" placeholder="请输入多行内容..." rows={3} />
							</div>
						</div>
					</div>

					{/* Status Messages */}
					<div className="space-y-2">
						<h3 className="text-sm font-medium">状态消息</h3>
						<div className="space-y-2">
							<div
								className="p-3 rounded-lg border"
								style={{
									backgroundColor: "var(--color-success-bg)",
									borderColor: "var(--color-success)",
									color: "var(--color-success)",
								}}
							>
								✓ 操作成功完成
							</div>
							<div
								className="p-3 rounded-lg border"
								style={{
									backgroundColor: "var(--color-warning-bg)",
									borderColor: "var(--color-warning)",
									color: "var(--color-warning)",
								}}
							>
								⚠ 请注意这个警告信息
							</div>
							<div
								className="p-3 rounded-lg border"
								style={{
									backgroundColor: "var(--color-error-bg)",
									borderColor: "var(--color-error)",
									color: "var(--color-error)",
								}}
							>
								✕ 发生了一个错误
							</div>
							<div
								className="p-3 rounded-lg border"
								style={{
									backgroundColor: "var(--color-info-bg)",
									borderColor: "var(--color-info)",
									color: "var(--color-info)",
								}}
							>
								ℹ 这是一条提示信息
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* CSS Variables Reference */}
			<Card className="p-6">
				<h2 className="text-xl font-semibold mb-4">CSS 变量参考</h2>
				<div className="space-y-2 text-sm font-mono">
					<p className="text-muted-foreground">所有颜色都可以通过 CSS 变量访问：</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
						<code>var(--color-primary)</code>
						<code>var(--color-success)</code>
						<code>var(--color-text-primary)</code>
						<code>var(--color-bg-container)</code>
						<code>var(--color-border-base)</code>
						<code>var(--shadow-md)</code>
					</div>
				</div>
			</Card>
		</div>
	)
}
