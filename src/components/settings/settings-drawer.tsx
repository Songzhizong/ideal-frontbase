/**
 * Settings Drawer - Theme customization UI
 */

import { Download, Palette, RotateCcw, Settings, Upload } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { defaultThemeSettings } from "@/config/theme-presets"
import { useThemeStore } from "@/hooks/use-theme-store"
import { ColorPaletteDesigner } from "./color-palette-designer"
import { FontConfigurator } from "./font-configurator"
import { LayoutConfigurator } from "./layout-configurator"
import { ThemeModeSelector } from "./theme-mode-selector"
import { ThemePresetSelector } from "./theme-preset-selector"
import { ThemePreview } from "./theme-preview"
import { UIConfigurator } from "./ui-configurator"

export function SettingsDrawer() {
	const store = useThemeStore()
	const [isPaletteOpen, setIsPaletteOpen] = useState(false)
	const isDev = import.meta.env.DEV

	const handleReset = () => {
		if (confirm("确定要重置所有设置吗？")) {
			store.setMode(defaultThemeSettings.mode)
			store.setPreset(defaultThemeSettings.activePreset)
			store.setFontFamily(defaultThemeSettings.fontFamily)
			store.setMenuLayout(defaultThemeSettings.layout.menuLayout)
			store.setContainerWidth(defaultThemeSettings.layout.containerWidth)
			store.setBorderRadius(defaultThemeSettings.ui.borderRadius)
			store.setPageAnimation(defaultThemeSettings.ui.pageAnimation)
		}
	}

	const handleExport = () => {
		const config = {
			mode: store.mode,
			activePreset: store.activePreset,
			fontFamily: store.fontFamily,
			layout: store.layout,
			ui: store.ui,
		}
		const blob = new Blob([JSON.stringify(config, null, 2)], {
			type: "application/json",
		})
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "theme-config.json"
		a.click()
		URL.revokeObjectURL(url)
	}

	const handleImport = () => {
		const input = document.createElement("input")
		input.type = "file"
		input.accept = "application/json"
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0]
			if (!file) return

			const reader = new FileReader()
			reader.onload = (event) => {
				try {
					const config = JSON.parse(event.target?.result as string) as {
						mode?: "light" | "dark" | "system"
						activePreset?: string
						fontFamily?: string
						layout?: {
							menuLayout?: "single" | "dual"
							containerWidth?: "full" | "fixed"
						}
						ui?: {
							borderRadius?: number
							pageAnimation?: "none" | "fade" | "slide-left" | "slide-bottom" | "slide-top"
						}
					}
					if (config.mode) store.setMode(config.mode)
					if (config.activePreset) store.setPreset(config.activePreset)
					if (config.fontFamily) store.setFontFamily(config.fontFamily)
					if (config.layout?.menuLayout) store.setMenuLayout(config.layout.menuLayout)
					if (config.layout?.containerWidth) store.setContainerWidth(config.layout.containerWidth)
					if (config.ui?.borderRadius) store.setBorderRadius(config.ui.borderRadius)
					if (config.ui?.pageAnimation) store.setPageAnimation(config.ui.pageAnimation)
					alert("主题配置导入成功！")
				} catch {
					alert("导入失败：配置文件格式错误")
				}
			}
			reader.readAsText(file)
		}
		input.click()
	}

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
				>
					<Settings className="h-5 w-5" />
				</Button>
			</SheetTrigger>
			<SheetContent className="w-full sm:max-w-md overflow-y-auto">
				<SheetHeader>
					<SheetTitle>主题设置</SheetTitle>
					<SheetDescription>自定义应用外观和配色方案</SheetDescription>
				</SheetHeader>

				<div className="mt-6 space-y-6">
					{/* Live Preview */}
					<section>
						<ThemePreview />
					</section>

					<Separator />

					{/* Theme Mode */}
					<section>
						<h3 className="mb-3 text-sm font-medium">主题模式</h3>
						<ThemeModeSelector />
					</section>

					<Separator />

					{/* Theme Presets */}
					<section>
						<h3 className="mb-3 text-sm font-medium">系统主题色</h3>
						<ThemePresetSelector />

						{/* Color Palette Designer Button - Dev Only */}
						{isDev && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsPaletteOpen(true)}
								className="w-full mt-3"
							>
								<Palette className="mr-2 h-4 w-4" />
								调色板设计器
							</Button>
						)}
					</section>

					<Separator />

					{/* Layout Configuration */}
					<section>
						<h3 className="mb-3 text-sm font-medium">布局配置</h3>
						<LayoutConfigurator />
					</section>

					<Separator />

					{/* UI Configuration */}
					<section>
						<h3 className="mb-3 text-sm font-medium">界面配置</h3>
						<UIConfigurator />
					</section>

					<Separator />

					{/* Font Configuration */}
					<section>
						<h3 className="mb-3 text-sm font-medium">字体配置</h3>
						<FontConfigurator />
					</section>

					<Separator />

					{/* Actions */}
					<section className="space-y-2">
						<Button variant="outline" size="sm" onClick={handleReset} className="w-full">
							<RotateCcw className="mr-2 h-4 w-4" />
							重置为默认
						</Button>
						<div className="grid grid-cols-2 gap-2">
							<Button variant="outline" size="sm" onClick={handleExport} className="w-full">
								<Download className="mr-2 h-4 w-4" />
								导出配置
							</Button>
							<Button variant="outline" size="sm" onClick={handleImport} className="w-full">
								<Upload className="mr-2 h-4 w-4" />
								导入配置
							</Button>
						</div>
					</section>
				</div>
			</SheetContent>

			{/* Color Palette Designer - Separate Drawer */}
			<ColorPaletteDesigner open={isPaletteOpen} onOpenChange={setIsPaletteOpen} />
		</Sheet>
	)
}
