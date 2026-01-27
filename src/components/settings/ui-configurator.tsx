/**
 * UI Configurator - Border radius and page animation settings
 */

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useThemeStore } from "@/hooks/use-theme-store"

export function UIConfigurator() {
	const { ui, setBorderRadius, setPageAnimation } = useThemeStore()

	const animations = [
		{ value: "none" as const, label: "无动画" },
		{ value: "fade" as const, label: "淡入" },
		{ value: "slide-left" as const, label: "左滑" },
		{ value: "slide-bottom" as const, label: "下滑" },
		{ value: "slide-top" as const, label: "上滑" },
	]

	return (
		<div className="space-y-4">
			{/* Border Radius */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<Label className="text-xs text-muted-foreground">圆角大小</Label>
					<span className="text-xs font-mono text-muted-foreground">{ui.borderRadius}px</span>
				</div>
				<Slider
					value={[ui.borderRadius]}
					onValueChange={([value]) => value !== undefined && setBorderRadius(value)}
					min={0}
					max={16}
					step={1}
					className="w-full"
				/>
				<div className="flex gap-2">
					{[0, 4, 8, 12, 16].map((radius) => (
						<Button
							key={radius}
							variant={ui.borderRadius === radius ? "default" : "outline"}
							size="sm"
							onClick={() => setBorderRadius(radius)}
							className="flex-1 text-xs"
						>
							{radius}
						</Button>
					))}
				</div>
			</div>

			{/* Page Animation */}
			<div className="space-y-2">
				<Label className="text-xs text-muted-foreground">页面动画</Label>
				<div className="grid grid-cols-2 gap-2">
					{animations.map(({ value, label }) => (
						<Button
							key={value}
							variant={ui.pageAnimation === value ? "default" : "outline"}
							size="sm"
							onClick={() => setPageAnimation(value)}
							className="text-xs"
						>
							{label}
						</Button>
					))}
				</div>
			</div>
		</div>
	)
}
