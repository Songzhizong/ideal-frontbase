/**
 * Theme Preset Selector - Choose from predefined color schemes
 */

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { themePresets } from "@/config/theme-presets"
import { useThemeStore } from "@/hooks/use-theme-store"
import { cn } from "@/lib/utils"

export function ThemePresetSelector() {
	const { activePreset, setPreset, getEffectiveMode } = useThemeStore()
	const effectiveMode = getEffectiveMode()

	return (
		<div className="grid grid-cols-2 gap-3">
			{themePresets.map((preset) => {
				const isActive = activePreset === preset.key
				const primaryColor = preset.schemes[effectiveMode].brand.primary

				return (
					<Button
						key={preset.key}
						variant="outline"
						onClick={() => setPreset(preset.key)}
						className={cn(
							"relative h-auto flex-col items-start gap-2 p-3",
							isActive && "border-2 border-primary",
						)}
					>
						{isActive && <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />}
						<div className="h-8 w-full rounded" style={{ backgroundColor: primaryColor }} />
						<div className="text-left">
							<div className="text-sm font-medium">{preset.name}</div>
							{preset.description && (
								<div className="text-xs text-muted-foreground">{preset.description}</div>
							)}
						</div>
					</Button>
				)
			})}
		</div>
	)
}
