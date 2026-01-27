/**
 * Color Palette Designer - Advanced color editing with preview
 * Only accessible in development mode
 */

import { Eye, Moon, Sun } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet"
import { useThemeStore } from "@/hooks/use-theme-store"
import type { ColorPalette } from "@/types/theme"

type ColorMode = "light" | "dark"

interface ColorPaletteDesignerProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ColorPaletteDesigner({ open, onOpenChange }: ColorPaletteDesignerProps) {
	const { getActivePreset, getEffectiveMode } = useThemeStore()
	const [editMode, setEditMode] = useState<ColorMode>(getEffectiveMode())

	const activePreset = getActivePreset()
	if (!activePreset) return null

	const palette = activePreset.schemes[editMode]

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
				<SheetHeader>
					<SheetTitle>调色板设计器</SheetTitle>
					<SheetDescription>设计和预览主题颜色 - 当前主题: {activePreset.name}</SheetDescription>
				</SheetHeader>

				<div className="mt-6 space-y-6">
					{/* Mode Tabs */}
					<div className="flex gap-2">
						<Button
							variant={editMode === "light" ? "default" : "outline"}
							size="sm"
							onClick={() => setEditMode("light")}
							className="flex-1"
						>
							<Sun className="mr-2 h-4 w-4" />
							明亮模式
						</Button>
						<Button
							variant={editMode === "dark" ? "default" : "outline"}
							size="sm"
							onClick={() => setEditMode("dark")}
							className="flex-1"
						>
							<Moon className="mr-2 h-4 w-4" />
							暗黑模式
						</Button>
					</div>

					<Separator />

					{/* Preview Section */}
					<section>
						<h3 className="mb-3 text-sm font-medium flex items-center gap-2">
							<Eye className="h-4 w-4" />
							实时预览
						</h3>
						<ColorPreview palette={palette} />
					</section>

					<Separator />

					{/* Color Editor Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Left Column */}
						<div className="space-y-4">
							<ColorSection title="品牌色" colors={getBrandColors(palette)} />
							<ColorSection title="功能色" colors={getFunctionalColors(palette)} />
							<ColorSection title="文本色" colors={getTextColors(palette)} />
						</div>

						{/* Right Column */}
						<div className="space-y-4">
							<ColorSection title="背景色" colors={getBackgroundColors(palette)} />
							<ColorSection title="边框色" colors={getBorderColors(palette)} />
						</div>
					</div>

					<Separator />

					{/* Info */}
					<div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
						<p className="font-medium mb-2">开发提示</p>
						<ul className="space-y-1 text-xs">
							<li>• 当前为只读模式，颜色修改功能需要实现持久化存储</li>
							<li>• 修改后的颜色将实时应用到预览区域</li>
							<li>• 建议使用色彩对比度检查工具确保可访问性 (WCAG AA)</li>
						</ul>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	)
}

// Preview Component
function ColorPreview({ palette }: { palette: ColorPalette }) {
	return (
		<div
			className="rounded-lg border p-6 space-y-4"
			style={{
				backgroundColor: palette.background.canvas,
				borderColor: palette.border.base,
			}}
		>
			{/* Card Example */}
			<div
				className="rounded-lg border p-4 space-y-3"
				style={{
					backgroundColor: palette.background.container,
					borderColor: palette.border.base,
				}}
			>
				<h4 className="text-lg font-semibold" style={{ color: palette.text.primary }}>
					预览卡片
				</h4>
				<p className="text-sm" style={{ color: palette.text.secondary }}>
					这是一段次要文本，用于展示文本层级效果。
				</p>
				<div className="flex gap-2">
					<button
						type="button"
						className="px-3 py-1.5 rounded text-sm font-medium"
						style={{
							backgroundColor: palette.brand.primary,
							color: palette.text.inverse,
						}}
					>
						主要按钮
					</button>
					<button
						type="button"
						className="px-3 py-1.5 rounded text-sm font-medium border"
						style={{
							backgroundColor: palette.background.container,
							color: palette.text.primary,
							borderColor: palette.border.base,
						}}
					>
						次要按钮
					</button>
				</div>
			</div>

			{/* Status Badges */}
			<div className="flex gap-2 flex-wrap">
				<StatusBadge color={palette.functional.success} label="成功" />
				<StatusBadge color={palette.functional.warning} label="警告" />
				<StatusBadge color={palette.functional.error} label="错误" />
				<StatusBadge color={palette.functional.info} label="信息" />
			</div>

			{/* Link Example */}
			<p className="text-sm" style={{ color: palette.text.secondary }}>
				这是一个 <span style={{ color: palette.text.link }}>链接示例</span> 的展示
			</p>
		</div>
	)
}

function StatusBadge({ color, label }: { color: string; label: string }) {
	return (
		<span
			className="px-2 py-1 rounded text-xs font-medium"
			style={{
				backgroundColor: `${color}15`,
				color: color,
			}}
		>
			{label}
		</span>
	)
}

// Color Section Component
interface ColorSectionProps {
	title: string
	colors: Array<{ label: string; value: string; key: string }>
}

function ColorSection({ title, colors }: ColorSectionProps) {
	return (
		<div className="rounded-lg border p-4">
			<h4 className="text-sm font-medium mb-3">{title}</h4>
			<div className="space-y-3">
				{colors.map((color) => (
					<ColorInput
						key={color.key}
						colorKey={color.key}
						label={color.label}
						value={color.value}
					/>
				))}
			</div>
		</div>
	)
}

// Color Input Component
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
		<div className="flex items-center gap-3">
			<div
				className="h-10 w-10 rounded border shrink-0 cursor-pointer hover:scale-105 transition-transform"
				style={{ backgroundColor: value }}
				title={value}
			/>
			<div className="flex-1 min-w-0">
				<Label htmlFor={colorKey} className="text-xs text-muted-foreground">
					{label}
				</Label>
				<Input id={colorKey} type="text" value={value} readOnly className="h-8 text-xs font-mono" />
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
		{
			label: "链接悬停",
			value: palette.text.linkHover || "",
			key: "text-link-hover",
		},
	].filter((c) => c.value)
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
