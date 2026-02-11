import { Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Avatar, AvatarFallback } from "@/packages/ui/avatar"
import { Input } from "@/packages/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { cn } from "@/packages/ui-utils"
import {
  TENANT_PROJECT_ROLES,
  type TenantProjectMemberCandidate,
  type TenantProjectRole,
} from "../types/tenant-projects"

interface InitialMemberSelection {
  userId: string
  role: TenantProjectRole
}

interface ProjectInitialMembersSelectorProps {
  candidates: readonly TenantProjectMemberCandidate[]
  value: InitialMemberSelection[]
  onChange: (nextValue: InitialMemberSelection[]) => void
}

const ROLE_OPTIONS: ReadonlyArray<{ value: TenantProjectRole; label: string }> =
  TENANT_PROJECT_ROLES.map((role) => ({
    value: role,
    label: role,
  }))

function sortMemberSelections(value: InitialMemberSelection[]) {
  return [...value].sort((left, right) => left.userId.localeCompare(right.userId, "zh-CN"))
}

function buildMemberInitial(name: string) {
  const normalized = name.trim()
  if (normalized.length === 0) {
    return "?"
  }

  return normalized.slice(0, 1).toUpperCase()
}

export function ProjectInitialMembersSelector({
  candidates,
  value,
  onChange,
}: ProjectInitialMembersSelectorProps) {
  const [memberQuery, setMemberQuery] = useState("")

  const selectedMemberMap = useMemo(() => {
    return new Map(value.map((member) => [member.userId, member]))
  }, [value])

  const filteredCandidates = useMemo(() => {
    const query = memberQuery.trim().toLocaleLowerCase()
    if (query.length === 0) {
      return candidates
    }

    return candidates.filter((candidate) => {
      const searchable = `${candidate.displayName} ${candidate.email}`.toLocaleLowerCase()
      return searchable.includes(query)
    })
  }, [candidates, memberQuery])

  const toggleMemberInvitation = (candidate: TenantProjectMemberCandidate) => {
    const selected = selectedMemberMap.get(candidate.userId)
    if (selected) {
      onChange(value.filter((item) => item.userId !== candidate.userId))
      return
    }

    onChange(
      sortMemberSelections([
        ...value,
        {
          userId: candidate.userId,
          role: candidate.defaultRole,
        },
      ]),
    )
  }

  if (candidates.length === 0) {
    return (
      <p className="rounded-xl border border-border/50 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
        当前租户暂无可邀请成员。
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={memberQuery}
          onChange={(event) => setMemberQuery(event.target.value)}
          placeholder="搜索成员姓名或邮箱"
          className="cursor-text pl-9"
        />
      </div>

      <div className="h-64 overflow-y-auto rounded-2xl border border-border/60 bg-muted/20 p-2">
        {filteredCandidates.length === 0 ? (
          <p className="rounded-xl border border-border/50 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
            未找到匹配成员，请调整关键词后重试。
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredCandidates.map((candidate) => {
              const selectedMember = selectedMemberMap.get(candidate.userId)
              const invited = Boolean(selectedMember)
              const selectedRole = selectedMember?.role ?? candidate.defaultRole

              return (
                <li key={candidate.userId}>
                  <div
                    className={cn(
                      "grid gap-3 rounded-xl border px-3 py-2.5 transition-colors sm:grid-cols-[minmax(0,1fr)_132px] sm:items-center",
                      invited
                        ? "border-primary/60 bg-primary/5"
                        : "border-border/50 bg-background/80 hover:border-border",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleMemberInvitation(candidate)}
                      className="flex min-w-0 cursor-pointer items-center gap-3 text-left"
                    >
                      <Avatar className="size-9">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold",
                            invited
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {buildMemberInitial(candidate.displayName)}
                        </AvatarFallback>
                      </Avatar>

                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {candidate.displayName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {candidate.email}
                        </span>
                      </span>
                    </button>

                    <Select
                      value={selectedRole}
                      disabled={!invited}
                      onValueChange={(nextRole) => {
                        onChange(
                          sortMemberSelections(
                            value.map((member) => {
                              if (member.userId !== candidate.userId) {
                                return member
                              }

                              return {
                                ...member,
                                role: nextRole as TenantProjectRole,
                              }
                            }),
                          ),
                        )
                      }}
                    >
                      <SelectTrigger className="h-8 w-full cursor-pointer rounded-lg">
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
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export type { InitialMemberSelection }
