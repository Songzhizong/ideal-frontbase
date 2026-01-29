import { Badge } from "@/components/ui/badge"
import { useColorHash } from "@/hooks/use-color-hash"
import { cn } from "@/lib/utils"
import { UserGroupEnum } from "../types"

interface UserGroupBadgesProps {
	userGroups: string[]
	className?: string
}

export function UserGroupBadges({ userGroups, className }: UserGroupBadgesProps) {
	return (
		<div className={cn("flex flex-wrap gap-1", className)}>
			{userGroups.map((group) => (
				<UserGroupBadge key={group} group={group} />
			))}
		</div>
	)
}

function UserGroupBadge({ group }: { group: string }) {
	const groupName = UserGroupEnum[group as keyof typeof UserGroupEnum] || group
	const { style } = useColorHash(group)

	return (
		<Badge variant="outline" className={cn("text-xs border transition-colors")} style={style}>
			{groupName}
		</Badge>
	)
}
