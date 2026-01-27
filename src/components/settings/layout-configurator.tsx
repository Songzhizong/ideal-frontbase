/**
 * Layout Configurator - Menu layout and container width settings
 */

import { LayoutGrid, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useThemeStore } from "@/hooks/use-theme-store"

export function LayoutConfigurator() {
	const { layout, setMenuLayout, setContainerWidth } = useThemeStore()

	return (
		<div className="space-y-4">
			{/* Menu Layout */}
			<div className="space-y-2">
				<Label className="text-xs text-muted-foreground">菜单布局</Label>
				<div className="grid grid-cols-2 gap-2">
					<Button
						variant={layout.menuLayout === "single" ? "default" : "outline"}
						size="sm"
						onClick={() => setMenuLayout("single")}
						className="flex flex-col gap-1 h-auto py-3"
					>
						<LayoutGrid className="h-4 w-4" />
						<span className="text-xs">单栏</span>
					</Button>
					<Button
						variant={layout.menuLayout === "dual" ? "default" : "outline"}
						size="sm"
						onClick={() => setMenuLayout("dual")}
						className="flex flex-col gap-1 h-auto py-3"
					>
						<LayoutGrid className="h-4 w-4" />
						<span className="text-xs">双栏</span>
					</Button>
				</div>
			</div>

			{/* Container Width */}
			<div className="space-y-2">
				<Label className="text-xs text-muted-foreground">容器宽度</Label>
				<div className="grid grid-cols-2 gap-2">
					<Button
						variant={layout.containerWidth === "full" ? "default" : "outline"}
						size="sm"
						onClick={() => setContainerWidth("full")}
						className="flex flex-col gap-1 h-auto py-3"
					>
						<Maximize2 className="h-4 w-4" />
						<span className="text-xs">全宽</span>
					</Button>
					<Button
						variant={layout.containerWidth === "fixed" ? "default" : "outline"}
						size="sm"
						onClick={() => setContainerWidth("fixed")}
						className="flex flex-col gap-1 h-auto py-3"
					>
						<Maximize2 className="h-4 w-4" />
						<span className="text-xs">固定</span>
					</Button>
				</div>
			</div>
		</div>
	)
}
