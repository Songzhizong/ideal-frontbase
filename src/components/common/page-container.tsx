import type * as React from "react"
import { useThemeStore } from "@/hooks/use-theme-store"
import { cn } from "@/lib/utils"

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageContainer({ className, ...props }: PageContainerProps) {
	const containerWidth = useThemeStore((state) => state.layout.containerWidth)

	return (
		<div
			className={cn(
				"mx-auto w-full px-6 py-6 sm:px-4 lg:px-8",
				containerWidth === "fixed" && "max-w-6xl",
				className,
			)}
			{...props}
		/>
	)
}
