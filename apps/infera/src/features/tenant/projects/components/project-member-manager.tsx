import { Check, ChevronsUpDown, Trash2, UserPlus } from "lucide-react"
import { useMemo, useState } from "react"
import { useAuthStore } from "@/packages/auth-core/auth-store"
import { Avatar, AvatarFallback } from "@/packages/ui/avatar"
import { Button } from "@/packages/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/packages/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/packages/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { cn } from "@/packages/ui-utils"
import {
  TENANT_PROJECT_ROLES,
  type TenantProjectMemberCandidate,
  type TenantProjectRole,
} from "../types/tenant-projects"
import type { InitialMemberSelection } from "./project-initial-members-selector"

interface ProjectMemberManagerProps {
  candidates: readonly TenantProjectMemberCandidate[]
  value: InitialMemberSelection[]
  onChange: (nextValue: InitialMemberSelection[]) => void
}

const ROLE_OPTIONS: ReadonlyArray<{ value: TenantProjectRole; label: string }> =
  TENANT_PROJECT_ROLES.map((role) => ({
    value: role,
    label: role,
  }))

function getInitials(name: string) {
  return name.slice(0, 1).toUpperCase()
}

export function ProjectMemberManager({ candidates, value, onChange }: ProjectMemberManagerProps) {
  const { user: currentUser } = useAuthStore()
  const [open, setOpen] = useState(false)

  const selectedMemberMap = useMemo(() => {
    return new Map(value.map((member) => [member.userId, member]))
  }, [value])

  const unselectedCandidates = useMemo(() => {
    return candidates.filter((candidate) => !selectedMemberMap.has(candidate.userId))
  }, [candidates, selectedMemberMap])

  // Enhance value with candidate details and sort
  const sortedDetailedMembers = useMemo(() => {
    return [...value]
      .map((member) => ({
        ...member,
        candidate: candidates.find((c) => c.userId === member.userId),
      }))
      .filter((item) => item.candidate !== undefined)
      .sort((a, b) => {
        // Current user first
        if (a.userId === currentUser?.userId) return -1
        if (b.userId === currentUser?.userId) return 1

        // Then sort by name
        return (a.candidate?.displayName ?? "").localeCompare(
          b.candidate?.displayName ?? "",
          "zh-CN",
        )
      })
  }, [value, candidates, currentUser?.userId])

  const addMember = (candidate: TenantProjectMemberCandidate) => {
    onChange([
      ...value,
      {
        userId: candidate.userId,
        role: candidate.defaultRole,
      },
    ])
    setOpen(false)
  }

  const removeMember = (userId: string) => {
    onChange(value.filter((member) => member.userId !== userId))
  }

  const updateMemberRole = (userId: string, newRole: string) => {
    onChange(
      value.map((member) => {
        if (member.userId !== userId) return member
        return { ...member, role: newRole as TenantProjectRole }
      }),
    )
  }

  return (
    <div className="space-y-4">
      {/* 1. Add Member Search */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-10 w-full justify-between border-dashed bg-muted/20 text-muted-foreground hover:bg-muted/40"
          >
            <span className="flex items-center gap-2">
              <UserPlus className="size-4" />
              搜索并添加成员...
            </span>
            <ChevronsUpDown className="ml-2 size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="输入姓名或邮箱搜索..." />
            <CommandList>
              <CommandEmpty>未找到更多可添加成员</CommandEmpty>
              <CommandGroup heading="建议成员">
                {unselectedCandidates.map((candidate) => (
                  <CommandItem
                    key={candidate.userId}
                    value={`${candidate.displayName} ${candidate.email}`}
                    onSelect={() => addMember(candidate)}
                    className="cursor-pointer gap-2"
                  >
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {getInitials(candidate.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{candidate.displayName}</span>
                      <span className="text-xs text-muted-foreground">{candidate.email}</span>
                    </div>
                    <Check className={cn("ml-auto h-4 w-4 opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 2. Member List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-muted-foreground">
            已选成员 ({value.length})
          </span>
        </div>

        <div className="max-h-[320px] overflow-y-auto rounded-xl border border-border/60 bg-muted/10 p-1">
          {sortedDetailedMembers.length === 0 ? (
            <div className="flex h-24 flex-col items-center justify-center gap-2 text-muted-foreground">
              <span className="text-sm">暂无成员</span>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedDetailedMembers.map(({ userId, role, candidate }) => {
                if (!candidate) return null // Should not happen due to filter

                const isCurrentUser = userId === currentUser?.userId

                return (
                  <div
                    key={userId}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-transparent bg-background p-2 transition-colors hover:border-border/60 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Avatar className="size-8 border border-border/20">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold",
                            isCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {getInitials(candidate.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {candidate.displayName}
                          </span>
                          {isCurrentUser && (
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              你
                            </span>
                          )}
                        </div>
                        <span
                          className="truncate text-xs text-muted-foreground"
                          title={candidate.email}
                        >
                          {candidate.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        value={role}
                        onValueChange={(val) => updateMemberRole(userId, val)}
                        disabled={isCurrentUser}
                      >
                        <SelectTrigger className="h-7 w-[90px] text-xs shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                          {ROLE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-xs">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={isCurrentUser}
                        onClick={() => removeMember(userId)}
                        className={cn(
                          "size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                          isCurrentUser && "opacity-0 pointer-events-none",
                        )}
                        title="移除成员"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
