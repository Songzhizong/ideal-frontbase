/**
 * Font Configurator - Font family selection
 */

import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useThemeStore } from "@/hooks/use-theme-store"

const fontOptions = [
	{ value: "system", label: "系统默认", family: "system-ui" },
	{
		value: "sans",
		label: "无衬线",
		family: "ui-sans-serif, system-ui, sans-serif",
	},
	{ value: "serif", label: "衬线", family: "ui-serif, Georgia, serif" },
	{ value: "mono", label: "等宽", family: "ui-monospace, monospace" },
	{
		value: "inter",
		label: "Inter",
		family: "Inter, ui-sans-serif, system-ui, sans-serif",
	},
	{
		value: "roboto",
		label: "Roboto",
		family: "Roboto, ui-sans-serif, system-ui, sans-serif",
	},
]

export function FontConfigurator() {
	const { fontFamily, setFontFamily } = useThemeStore()

	const handleFontChange = (value: string) => {
		setFontFamily(value)
		const font = fontOptions.find((f) => f.value === value)
		if (font) {
			document.documentElement.style.setProperty("--font-family", font.family)
		}
	}

	return (
		<div className="space-y-2">
			<Label className="text-xs text-muted-foreground">字体</Label>
			<Select value={fontFamily} onValueChange={handleFontChange}>
				<SelectTrigger>
					<SelectValue placeholder="选择字体" />
				</SelectTrigger>
				<SelectContent>
					{fontOptions.map((font) => (
						<SelectItem key={font.value} value={font.value}>
							<span style={{ fontFamily: font.family }}>{font.label}</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className="text-xs text-muted-foreground">
				预览：
				<span
					style={{
						fontFamily: fontOptions.find((f) => f.value === fontFamily)?.family || "system-ui",
					}}
				>
					The quick brown fox jumps over the lazy dog
				</span>
			</p>
		</div>
	)
}
