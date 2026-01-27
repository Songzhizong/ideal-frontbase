import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useThemeStore } from "@/hooks/use-theme-store"

export function ThemeTest() {
	const { mode, setMode, activePreset } = useThemeStore()

	return (
		<div className="p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>主题系统测试</CardTitle>
					<CardDescription>测试颜色配置是否正确应用</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Button
							variant={mode === "light" ? "default" : "outline"}
							onClick={() => setMode("light")}
						>
							浅色模式
						</Button>
						<Button
							variant={mode === "dark" ? "default" : "outline"}
							onClick={() => setMode("dark")}
						>
							深色模式
						</Button>
						<Button
							variant={mode === "system" ? "default" : "outline"}
							onClick={() => setMode("system")}
						>
							系统模式
						</Button>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<h3 className="font-semibold">品牌色测试</h3>
							<div className="flex gap-2">
								<div className="w-8 h-8 bg-primary rounded" title="Primary" />
								<div className="w-8 h-8 bg-secondary rounded" title="Secondary" />
								<div className="w-8 h-8 bg-destructive rounded" title="Destructive" />
							</div>
						</div>

						<div className="space-y-2">
							<h3 className="font-semibold">状态色测试</h3>
							<div className="flex gap-2">
								<div className="w-8 h-8 rounded bg-success" title="Success" />
								<div className="w-8 h-8 rounded bg-warning" title="Warning" />
								<div className="w-8 h-8 rounded bg-error" title="Error" />
								<div className="w-8 h-8 rounded bg-info" title="Info" />
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<h3 className="font-semibold">文字色测试</h3>
						<p className="text-foreground">主要文字 (text-foreground)</p>
						<p className="text-muted-foreground">次要文字 (text-muted-foreground)</p>
						<p className="text-muted-foreground/60">弱化文字 (text-muted-foreground/60)</p>
					</div>

					<div className="space-y-2">
						<h3 className="font-semibold">背景色测试</h3>
						<div className="grid grid-cols-3 gap-2">
							<div className="p-2 rounded text-sm bg-background border border-border">
								Background
							</div>
							<div className="p-2 rounded text-sm bg-card border border-border">Card</div>
							<div className="p-2 rounded text-sm bg-popover border border-border">Popover</div>
						</div>
					</div>

					<div className="space-y-2">
						<h3 className="font-semibold">当前配置</h3>
						<p className="text-sm text-muted-foreground">
							模式: {mode} | 预设: {activePreset}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
