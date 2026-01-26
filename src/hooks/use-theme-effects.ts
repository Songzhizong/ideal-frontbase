import * as React from "react"
import { fonts } from "@/app/fonts"
import { useUiStore } from "@/hooks/use-ui-store"

export function useThemeEffects() {
	const { borderRadius, themeColors, theme, fontFamily } = useUiStore()

	React.useEffect(() => {
		if (typeof document === "undefined") {
			return
		}

		const root = document.documentElement
		root.style.setProperty("--radius", `${borderRadius}px`)

		// 应用字体
		for (const font of fonts) {
			const fontClass = `font-${font.replace(/\s+/g, "-").toLowerCase()}`
			root.classList.remove(fontClass)
		}
		const currentFontClass = `font-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`
		root.classList.add(currentFontClass)
		root.style.fontFamily = `var(--${currentFontClass})`

		// 根据暗色模式调整默认主色
		let primaryColor = themeColors.primary
		const isDark =
			theme === "dark" ||
			(theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

		if (isDark && primaryColor === "#0f172a") {
			primaryColor = "#3b82f6" // 典型的蓝色，在深色背景上可读性好
		}

		// 动态设置前景色（文字颜色）
		if (isDark) {
			// 在深色模式下，强制主色前景色为白色，解决实心彩色按钮文字看不清的问题
			root.style.setProperty("--primary-foreground", "0 0% 100%")
			root.style.setProperty("--sidebar-primary-foreground", "0 0% 100%")
			root.style.setProperty("--color-primary-foreground", "white")
			root.style.setProperty("--color-sidebar-primary-foreground", "white")
		} else {
			// 浅色模式下还原为 globals.css 中定义的默认值
			// 注意：globals.css 中 --primary-foreground 本来就是近白色 (0 0% 98%)
			// 因为浅色模式下 --primary 是深色 (#0f172a)
			root.style.setProperty("--primary-foreground", "0 0% 98%")
			root.style.setProperty("--sidebar-primary-foreground", "0 0% 98%")
			root.style.setProperty("--color-primary-foreground", "white")
			root.style.setProperty("--color-sidebar-primary-foreground", "white")
		}

		root.style.setProperty("--color-primary", primaryColor)
		root.style.setProperty("--color-success", themeColors.success)
		root.style.setProperty("--color-warning", themeColors.warning)
		root.style.setProperty("--color-error", themeColors.error)
	}, [borderRadius, themeColors, theme, fontFamily])
}
