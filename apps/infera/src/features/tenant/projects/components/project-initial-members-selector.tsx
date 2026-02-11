import { useMemo } from "react"
import { Checkbox } from "@/packages/ui/checkbox"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import type { TenantProjectMemberCandidate, TenantProjectRole } from "../types/tenant-projects"

interface InitialMemberSelection {
  userId: string
  role: TenantProjectRole
}

interface ProjectInitialMembersSelectorProps {
  candidates: readonly TenantProjectMemberCandidate[]
  value: InitialMemberSelection[]
  onChange: (nextValue: InitialMemberSelection[]) => void
}

const ROLE_OPTIONS: ReadonlyArray<{ value: TenantProjectRole; label: string }> = [
  {
    value: "Owner",
    label: "Owner",
  },
  {
    value: "Maintainer",
    label: "Maintainer",
  },
  {
    value: "Member",
    label: "Member",
  },
]

function sortMemberSelections(value: InitialMemberSelection[]) {
  return [...value].sort((left, right) => left.userId.localeCompare(right.userId, "zh-CN"))
}

export function ProjectInitialMembersSelector({
  candidates,
  value,
  onChange,
}: ProjectInitialMembersSelectorProps) {
  const selectedMemberMap = useMemo(() => {
    return new Map(value.map((member) => [member.userId, member]))
  }, [value])

  if (candidates.length === 0) {
    return (
      <p className="rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
        当前租户暂无可分配成员。
      </p>
    )
  }

  return (
    <div className="space-y-2 rounded-md border border-border/50 bg-muted/20 p-3">
      {candidates.map((candidate) => {
        const selectedMember = selectedMemberMap.get(candidate.userId)
        const checked = Boolean(selectedMember)

        return (
          <div
            key={candidate.userId}
            className="grid gap-2 rounded-md border border-border/40 bg-card p-3 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-center"
          >
            <Label className="flex cursor-pointer items-start gap-2">
              <Checkbox
                checked={checked}
                onCheckedChange={(nextChecked) => {
                  if (nextChecked) {
                    onChange(
                      sortMemberSelections([
                        ...value,
                        {
                          userId: candidate.userId,
                          role: candidate.defaultRole,
                        },
                      ]),
                    )
                    return
                  }

                  onChange(value.filter((item) => item.userId !== candidate.userId))
                }}
                className="mt-0.5 cursor-pointer"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium text-foreground">
                  {candidate.displayName}
                </span>
                <span className="block text-xs text-muted-foreground">{candidate.email}</span>
              </span>
            </Label>

            <Select
              value={selectedMember?.role ?? candidate.defaultRole}
              disabled={!checked}
              onValueChange={(nextRole) => {
                if (!checked) {
                  return
                }

                onChange(
                  sortMemberSelections(
                    value.map((item) => {
                      if (item.userId !== candidate.userId) {
                        return item
                      }

                      return {
                        ...item,
                        role: nextRole as TenantProjectRole,
                      }
                    }),
                  ),
                )
              }}
            >
              <SelectTrigger className="h-8 w-full cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((roleOption) => (
                  <SelectItem key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })}
    </div>
  )
}

export type { InitialMemberSelection }
