import { LoaderCircle, RefreshCw, Search, X } from "lucide-react"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Card, CardContent } from "@/packages/ui/card"
import { Input } from "@/packages/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { cn } from "@/packages/ui-utils"
import type { TenantProjectEnvironment, TenantProjectOwnerOption } from "../types/tenant-projects"
import { TENANT_PROJECT_ENVIRONMENTS } from "../types/tenant-projects"
import { TENANT_PROJECT_COST_RANGE_OPTIONS } from "../utils/tenant-projects-formatters"

const ALL_FILTER_VALUE = "__all__"

interface TenantProjectsFilterPanelProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  environment: string | null
  ownerId: string | null
  costRange: string | null
  ownerOptions: readonly TenantProjectOwnerOption[]
  onEnvironmentChange: (value: string | null) => void
  onOwnerChange: (value: string | null) => void
  onCostRangeChange: (value: string | null) => void
  onRefresh: () => void
  onReset: () => void
  refreshing: boolean
  hasActiveFilters: boolean
  pageStart: number
  pageEnd: number
  totalProjects: number
  isFetching: boolean
  environmentSummary: Record<TenantProjectEnvironment, number>
  activeFilterLabels: readonly string[]
}

export function TenantProjectsFilterPanel({
  searchInput,
  onSearchInputChange,
  environment,
  ownerId,
  costRange,
  ownerOptions,
  onEnvironmentChange,
  onOwnerChange,
  onCostRangeChange,
  onRefresh,
  onReset,
  refreshing,
  hasActiveFilters,
  pageStart,
  pageEnd,
  totalProjects,
  isFetching,
  environmentSummary,
  activeFilterLabels,
}: TenantProjectsFilterPanelProps) {
  return (
    <Card className="gap-0 border-border/60 py-0 shadow-xs">
      <CardContent className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center">
        <div className="relative min-w-57.5 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="搜索项目名称或 ID"
            className="pr-9 pl-9"
          />
          {searchInput.length > 0 ? (
            <button
              type="button"
              onClick={() => onSearchInputChange("")}
              className="absolute top-1/2 right-2 inline-flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="sr-only">清空搜索</span>
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:items-center">
          <Select
            value={environment ?? ALL_FILTER_VALUE}
            onValueChange={(value) =>
              onEnvironmentChange(value === ALL_FILTER_VALUE ? null : value)
            }
          >
            <SelectTrigger className="w-full cursor-pointer lg:w-36">
              <SelectValue placeholder="环境" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER_VALUE}>全部环境</SelectItem>
              {TENANT_PROJECT_ENVIRONMENTS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={ownerId ?? ALL_FILTER_VALUE}
            onValueChange={(value) => onOwnerChange(value === ALL_FILTER_VALUE ? null : value)}
          >
            <SelectTrigger className="w-full cursor-pointer lg:w-40">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER_VALUE}>全部 Owner</SelectItem>
              {ownerOptions.map((owner) => (
                <SelectItem key={owner.userId} value={owner.userId}>
                  {owner.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={costRange ?? ALL_FILTER_VALUE}
            onValueChange={(value) => onCostRangeChange(value === ALL_FILTER_VALUE ? null : value)}
          >
            <SelectTrigger className="w-full cursor-pointer lg:w-44">
              <SelectValue placeholder="成本区间" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER_VALUE}>全部成本</SelectItem>
              {TENANT_PROJECT_COST_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 lg:ml-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={refreshing}
              className="cursor-pointer"
            >
              <RefreshCw className={cn("size-4", refreshing ? "animate-spin" : "")} aria-hidden />
              刷新
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={!hasActiveFilters}
              className="cursor-pointer"
            >
              重置
            </Button>
          </div>
        </div>
      </CardContent>

      <CardContent className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 px-4 py-3">
        <div className="text-xs text-muted-foreground">
          显示 {pageStart}-{pageEnd} / {totalProjects} 项
          {isFetching ? (
            <span className="ml-2 inline-flex items-center gap-1">
              <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
              同步中
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
            Dev {environmentSummary.Dev}
          </Badge>
          <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
            Test {environmentSummary.Test}
          </Badge>
          <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
            Prod {environmentSummary.Prod}
          </Badge>
          {activeFilterLabels.map((label) => (
            <Badge key={label} variant="secondary" className="text-xs">
              {label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
