import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { UserGroupEnum } from "../types"

interface UserGroupBadgesProps {
	userGroups: string[]
	className?: string
}

// Define semantic color variants for user groups using CSS custom properties
const groupColorVariants = [
	"bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
	"bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
	"bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
	"bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
	"bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
	"bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
]

export function UserGroupBadges({ userGroups, className }: UserGroupBadgesProps) {
	return (
		<div className={cn("flex flex-wrap gap-1", className)}>
			{userGroups.map((group, index) => {
				const colorIndex = index % groupColorVariants.length
				const colorClasses = groupColorVariants[colorIndex]
				const groupName = UserGroupEnum[group as keyof typeof UserGroupEnum] || group

				return (
					<Badge key={group} variant="outline" className={cn("text-xs border", colorClasses)}>
						{groupName}
					</Badge>
				)
			})}
		</div>
	)
}
