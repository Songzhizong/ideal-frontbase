import { ContentLayout, type ContentLayoutProps } from "@/packages/layout-core"
import { cn } from "@/packages/ui-utils"

export interface ComponentDocContentLayoutProps extends ContentLayoutProps {}

export function ComponentDocContentLayout({
  className,
  contentClassName,
  ...props
}: ComponentDocContentLayoutProps) {
  return (
    <ContentLayout
      className={cn("px-4 py-4 sm:px-6 lg:px-8 lg:py-6", className)}
      contentClassName={cn("space-y-6", contentClassName)}
      {...props}
    />
  )
}
