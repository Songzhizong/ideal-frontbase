import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
	"inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground shadow hover:opacity-90",
				secondary: "border-transparent bg-secondary text-secondary-foreground hover:opacity-90",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground shadow hover:opacity-90",
				outline: "text-foreground",
				success: "border-transparent bg-success-bg text-success-foreground",
				warning: "border-transparent bg-warning-bg text-warning-foreground",
				error: "border-transparent bg-error-bg text-error-foreground",
				info: "border-transparent bg-info-bg text-info-foreground",
				"success-solid": "border-transparent bg-success text-success-foreground",
				"warning-solid": "border-transparent bg-warning text-warning-foreground",
				"error-solid": "border-transparent bg-error text-error-foreground",
				"info-solid": "border-transparent bg-info text-info-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
)

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
