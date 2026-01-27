/**
 * Color Customizer - Advanced color editing with Light/Dark mode tabs
 */

import { Moon, Sun } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useThemeStore } from "@/hooks/use-theme-store"
import { cn } from "@/lib/utils"
import type { ColorPalette } from "@/types/theme"

type ColorMode = "light" | "dark"

export function ColorCustomizer() {
	const { getActivePreset, getEffectiveMode } = useThemeStore()
	const [editMode, setEditMode] = useState<ColorMode>(getEffectiveMode())

	const activePreset = getActivePreset()
	if (!activePreset) return null

	const palette = activePreset.schemes[editMode]

	return (
		<div className="space-y-4">
			{/* Mode Tabs */}
			<div className="flex gap-2">
				<Button
					variant={editMode === "light" ? "default" : "outline"}
					size="sm"
					onClick={() => setEditMode("light")}
					className="flex-1"
				>
					<Sun className="mr-2 h-4 w-4" />
					浅色模式
				</Button>
				<Button
					variant={editMode === "dark" ? "default" : "outline"}
					size="sm"
					onClick={() => setEditMode("dark")}
					className="flex-1"
				>
					<Moon className="mr-2 h-4 w-4" />
					深色模式
				</Button>
			</div>

			{/* Color Groups */}
			<div className="space-y-4">
				<ColorGroup title="品牌色" colors={getBrandColors(palette)} />
				<ColorGroup title="功能色" colors={getFunctionalColors(palette)} />
				<ColorGroup title="文本色" colors={getTextColors(palette)} />
				<ColorGroup title="背景色" colors={getBackgroundColors(palette)} />
				<ColorGroup title="边框色" colors={getBorderColors(palette)} />
			</div>

			<p className="text-xs text-muted-foreground">
				提示：颜色修改功能需要实现持久化存储，当前仅展示预设值
			</p>
		</div>
	)
}

interface ColorGroup {
	title: string
	colors: Array<{ label: string; value: string; key: string }>
}

function ColorGroup({ title, colors }: ColorGroup) {
	const [isExpanded, setIsExpanded] = useState(false)

	return (
		<div className="rounded-lg border p-3">
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex w-full items-center justify-between text-sm font-medium"
			>
				{title}
				<span className={cn("transition-transform", isExpanded && "rotate-180")}>▼</span>
			</button>

			{isExpanded && (
				<div className="mt-3 space-y-2">
					{colors.map((color) => (
						<ColorInput
							key={color.key}
							colorKey={color.key}
							label={color.label}
							value={color.value}
						/>
					))}
				</div>
			)}
		</div>
	)
}

function ColorInput({
	label,
	value,
	colorKey,
}: {
	label: string
	value: string
	colorKey: string
}) {
	return (
		<div className="flex items-center gap-2">
			<div className="h-8 w-8 rounded border shrink-0" style={{ backgroundColor: value }} />
			<div className="flex-1 min-w-0">
				<Label htmlFor={colorKey} className="text-xs text-muted-foreground">
					{label}
				</Label>
				<Input id={colorKey} type="text" value={value} readOnly className="h-7 text-xs font-mono" />
			</div>
		</div>
	)
}

// Helper functions to extract colors from palette
function getBrandColors(palette: ColorPalette) {
	return [
		{ label: "主色", value: palette.brand.primary, key: "brand-primary" },
		{
			label: "主色悬停",
			value: palette.brand.primaryHover || "",
			key: "brand-primary-hover",
		},
		{
			label: "主色激活",
			value: palette.brand.primaryActive || "",
			key: "brand-primary-active",
		},
		{
			label: "主色背景",
			value: palette.brand.primaryBg || "",
			key: "brand-primary-bg",
		},
	].filter((c) => c.value)
}

function getFunctionalColors(palette: ColorPalette) {
	return [
		{ label: "成功", value: palette.functional.success, key: "func-success" },
		{ label: "警告", value: palette.functional.warning, key: "func-warning" },
		{ label: "错误", value: palette.functional.error, key: "func-error" },
		{ label: "信息", value: palette.functional.info, key: "func-info" },
	]
}

function getTextColors(palette: ColorPalette) {
	return [
		{ label: "主要文本", value: palette.text.primary, key: "text-primary" },
		{ label: "次要文本", value: palette.text.secondary, key: "text-secondary" },
		{ label: "禁用文本", value: palette.text.tertiary, key: "text-tertiary" },
		{ label: "反色文本", value: palette.text.inverse, key: "text-inverse" },
		{ label: "链接", value: palette.text.link, key: "text-link" },
	]
}

function getBackgroundColors(palette: ColorPalette) {
	return [
		{ label: "画布", value: palette.background.canvas, key: "bg-canvas" },
		{ label: "容器", value: palette.background.container, key: "bg-container" },
		{ label: "浮层", value: palette.background.elevated, key: "bg-elevated" },
		{ label: "布局", value: palette.background.layout, key: "bg-layout" },
		{ label: "悬停", value: palette.background.hover, key: "bg-hover" },
		{ label: "激活", value: palette.background.active, key: "bg-active" },
	]
}

function getBorderColors(palette: ColorPalette) {
	return [
		{ label: "基础边框", value: palette.border.base, key: "border-base" },
		{ label: "强调边框", value: palette.border.strong, key: "border-strong" },
		{ label: "分割线", value: palette.border.subtle, key: "border-subtle" },
	]
}
