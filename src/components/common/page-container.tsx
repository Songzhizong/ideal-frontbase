import type * as React from "react"
import { useThemeStore } from "@/hooks/use-theme-store"
import { cn } from "@/lib/utils"

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageContainer({ className, ...props }: PageContainerProps) {
	const containerWidth = useThemeStore((state) => state.layout.containerWidth)

	return (
		<div
			className={cn(
				"mx-auto w-full px-6 py-12 sm:px-8 lg:px-12",
				containerWidth === "fixed" && "max-w-6xl",
				className,
			)}
			{...props}
		/>
	)
}
