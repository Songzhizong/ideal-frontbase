/**
 * Theme Mode Selector - Light/Dark/System toggle
 */

import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/hooks/use-theme-store"

export function ThemeModeSelector() {
	const { mode, setMode } = useThemeStore()

	const modes = [
		{ value: "light" as const, label: "浅色", icon: Sun },
		{ value: "dark" as const, label: "深色", icon: Moon },
		{ value: "system" as const, label: "跟随系统", icon: Monitor },
	]

	return (
		<div className="grid grid-cols-3 gap-2">
			{modes.map(({ value, label, icon: Icon }) => (
				<Button
					key={value}
					variant={mode === value ? "default" : "outline"}
					size="sm"
					onClick={() => setMode(value)}
					className="flex flex-col gap-1 h-auto py-3"
				>
					<Icon className="h-4 w-4" />
					<span className="text-xs">{label}</span>
				</Button>
			))}
		</div>
	)
}
