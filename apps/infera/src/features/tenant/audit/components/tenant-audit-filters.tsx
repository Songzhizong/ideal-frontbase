import { RefreshCcw, Search, Undo2 } from "lucide-react"
import { Button } from "@/packages/ui/button"
import { DateRangePicker } from "@/packages/ui/date-picker-rac"
import { Input } from "@/packages/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import type {
  TenantAuditActorType,
  TenantAuditProjectOption,
  TenantAuditTableFilters,
} from "../types/tenant-audit"

interface TenantAuditFiltersProps {
  filters: TenantAuditTableFilters
  actionOptions: readonly string[]
  resourceTypeOptions: readonly string[]
  projectOptions: readonly TenantAuditProjectOption[]
  showProjectFilter?: boolean
  hasActiveFilters: boolean
  refreshing: boolean
  onActorQueryChange: (value: string) => void
  onActorTypeChange: (value: TenantAuditActorType | null) => void
  onActionChange: (value: string | null) => void
  onResourceTypeChange: (value: string | null) => void
  onProjectChange: (value: string | null) => void
  onDateRangeChange: (startTimeMs: number | null, endTimeMs: number | null) => void
  onReset: () => void
  onRefresh: () => void
}

export function TenantAuditFilters({
  filters,
  actionOptions,
  resourceTypeOptions,
  projectOptions,
  showProjectFilter = true,
  hasActiveFilters,
  refreshing,
  onActorQueryChange,
  onActorTypeChange,
  onActionChange,
  onResourceTypeChange,
  onProjectChange,
  onDateRangeChange,
  onReset,
  onRefresh,
}: TenantAuditFiltersProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-card p-4">
      <div className="grid gap-3 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DateRangePicker
            value={
              filters.startTimeMs
                ? {
                    from: new Date(filters.startTimeMs),
                    to: filters.endTimeMs ? new Date(filters.endTimeMs) : undefined,
                  }
                : undefined
            }
            onChange={(value) => {
              if (!value?.from) {
                onDateRangeChange(null, null)
                return
              }

              const end = value.to ? new Date(value.to).setHours(23, 59, 59, 999) : null
              onDateRangeChange(value.from.getTime(), end)
            }}
            placeholder="选择时间范围"
          />
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={filters.actorQuery}
            onChange={(event) => onActorQueryChange(event.target.value)}
            placeholder="按 Actor 姓名或邮箱过滤"
            className="pl-9"
          />
        </div>
      </div>

      <div
        className={`grid gap-3 md:grid-cols-2 ${showProjectFilter ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}
      >
        <Select
          value={filters.actorType ?? "all"}
          onValueChange={(value) =>
            onActorTypeChange(value === "all" ? null : (value as TenantAuditActorType))
          }
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Actor 类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              全部 Actor
            </SelectItem>
            <SelectItem value="user" className="cursor-pointer">
              用户
            </SelectItem>
            <SelectItem value="service_account" className="cursor-pointer">
              服务账号
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.action ?? "all"}
          onValueChange={(value) => onActionChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              全部 Action
            </SelectItem>
            {actionOptions.map((option) => (
              <SelectItem key={option} value={option} className="cursor-pointer">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.resourceType ?? "all"}
          onValueChange={(value) => onResourceTypeChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Resource Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              全部资源类型
            </SelectItem>
            {resourceTypeOptions.map((option) => (
              <SelectItem key={option} value={option} className="cursor-pointer">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showProjectFilter ? (
          <Select
            value={filters.projectId ?? "all"}
            onValueChange={(value) => onProjectChange(value === "all" ? null : value)}
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                全部项目
              </SelectItem>
              {projectOptions.map((option) => (
                <SelectItem
                  key={option.projectId}
                  value={option.projectId}
                  className="cursor-pointer"
                >
                  {option.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="cursor-pointer"
          >
            <Undo2 className="size-4" aria-hidden />
            重置
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={refreshing}
            className="cursor-pointer"
          >
            <RefreshCcw className={refreshing ? "size-4 animate-spin" : "size-4"} aria-hidden />
            刷新
          </Button>
        </div>
      </div>
    </div>
  )
}
