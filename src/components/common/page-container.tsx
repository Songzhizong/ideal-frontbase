import type * as React from "react"
import { useThemeStore } from "@/hooks/use-theme-store"
import { cn } from "@/lib/utils"

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageContainer({ className, ...props }: PageContainerProps) {
	const containerWidth = useThemeStore((state) => state.layout.containerWidth)

	return (
		<div
			className={cn(
				"mx-auto w-full py-4 px-4 xl:px-8 2xl:px-16",
				containerWidth === "fixed" && "max-w-7xl",
				className,
			)}
			{...props}
		/>
	)
}
