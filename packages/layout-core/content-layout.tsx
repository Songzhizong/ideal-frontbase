import type * as React from "react"
import { cn } from "@/packages/ui-utils"
import { PageHeader } from "./page-header"

export interface ContentLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	title?: React.ReactNode
	description?: React.ReactNode
	actions?: React.ReactNode
	headerClassName?: string
	contentClassName?: string
}

export function ContentLayout({
	title,
	description,
	actions,
	headerClassName,
	contentClassName,
	className,
	children,
	...props
}: ContentLayoutProps) {
	const showHeader = Boolean(title || description || actions)

	return (
		<div className={cn("px-6 py-6", className)} {...props}>
			<div className="space-y-6">
				{showHeader ? (
					<PageHeader
						title={title}
						description={description}
						actions={actions}
						className={headerClassName}
					/>
				) : null}
				<section className={cn("space-y-6", contentClassName)}>{children}</section>
			</div>
		</div>
	)
}
