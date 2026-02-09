import type * as React from "react"
import { useThemeStore } from "@/packages/theme-system"
import { cn } from "@/packages/ui-utils"

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageContainer({ className, ...props }: PageContainerProps) {
  const containerWidth = useThemeStore((state) => state.layout.containerWidth)

  return (
    <div
      className={cn(
        "mx-auto w-full py-4 px-6",
        containerWidth === "fixed" && "max-w-7xl",
        className,
      )}
      {...props}
    />
  )
}
