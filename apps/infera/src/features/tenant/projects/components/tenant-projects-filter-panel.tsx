import { LoaderCircle, RefreshCw, Search, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useMemo, useState } from "react"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/packages/ui/toggle-group"
import { cn } from "@/packages/ui-utils"
import type { TenantProjectEnvironment, TenantProjectOwnerOption } from "../types/tenant-projects"
import { TENANT_PROJECT_ENVIRONMENTS } from "../types/tenant-projects"
import { TENANT_PROJECT_COST_RANGE_OPTIONS } from "../utils/tenant-projects-formatters"

const ALL_FILTER_VALUE = "__all__"

const FILTER_SCOPES = ["environment", "owner", "cost"] as const

type FilterScope = (typeof FILTER_SCOPES)[number]

function isFilterScope(value: string): value is FilterScope {
  return FILTER_SCOPES.includes(value as FilterScope)
}

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
  const [activeScope, setActiveScope] = useState<FilterScope>("environment")
  const [compactSearchOpen, setCompactSearchOpen] = useState(false)

  const emphasizeSearch = totalProjects > 6

  const ownerSegmentItems = useMemo(
    () =>
      ownerOptions.map((owner) => (
        <ToggleGroupItem
          key={owner.userId}
          value={owner.userId}
          className="h-8 rounded-full px-3 text-xs"
        >
          {owner.displayName}
        </ToggleGroupItem>
      )),
    [ownerOptions],
  )

  const showCompactSearchInput = !emphasizeSearch && (compactSearchOpen || searchInput.length > 0)

  return (
    <section className="rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-primary/5 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="space-y-3 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          {emphasizeSearch ? (
            <div className="relative min-w-64 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                placeholder="搜索项目名称或 ID"
                className="border-none bg-muted/50 pr-9 pl-10 shadow-inner focus-visible:bg-background focus-visible:shadow-none"
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
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={showCompactSearchInput ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={() => {
                  setCompactSearchOpen((previous) => !previous)
                }}
                className="cursor-pointer"
              >
                <Search className="size-4" aria-hidden />
                <span className="sr-only">展开搜索</span>
              </Button>

              <AnimatePresence>
                {showCompactSearchInput ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <Input
                        value={searchInput}
                        onChange={(event) => onSearchInputChange(event.target.value)}
                        placeholder="搜索项目"
                        className="h-8 border-none bg-muted/50 pr-8 shadow-inner focus-visible:bg-background focus-visible:shadow-none"
                      />
                      {searchInput.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => onSearchInputChange("")}
                          className="absolute top-1/2 right-2 inline-flex size-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <span className="sr-only">清空搜索</span>
                          <X className="size-3" aria-hidden />
                        </button>
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <Tabs
            value={activeScope}
            onValueChange={(value) => {
              if (isFilterScope(value)) {
                setActiveScope(value)
              }
            }}
            className="min-w-0 flex-1 gap-2"
          >
            <TabsList className="h-8 bg-muted/60 p-1">
              <TabsTrigger value="environment" className="px-3 text-xs">
                Environment
              </TabsTrigger>
              <TabsTrigger value="owner" className="px-3 text-xs">
                Owner
              </TabsTrigger>
              <TabsTrigger value="cost" className="px-3 text-xs">
                Cost
              </TabsTrigger>
            </TabsList>

            <TabsContent value="environment" className="mt-2 text-foreground">
              <div className="overflow-x-auto pb-1">
                <ToggleGroup
                  type="single"
                  value={environment ?? ALL_FILTER_VALUE}
                  onValueChange={(value) =>
                    onEnvironmentChange(
                      value === ALL_FILTER_VALUE || value.length === 0 ? null : value,
                    )
                  }
                  variant="outline"
                  spacing={8}
                  className="w-max min-w-full"
                >
                  <ToggleGroupItem
                    value={ALL_FILTER_VALUE}
                    className="h-8 rounded-full px-3 text-xs"
                  >
                    全部环境
                  </ToggleGroupItem>
                  {TENANT_PROJECT_ENVIRONMENTS.map((item) => (
                    <ToggleGroupItem
                      key={item}
                      value={item}
                      className="h-8 rounded-full px-3 text-xs"
                    >
                      {item}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </TabsContent>

            <TabsContent value="owner" className="mt-2 text-foreground">
              <div className="overflow-x-auto pb-1">
                <ToggleGroup
                  type="single"
                  value={ownerId ?? ALL_FILTER_VALUE}
                  onValueChange={(value) =>
                    onOwnerChange(value === ALL_FILTER_VALUE || value.length === 0 ? null : value)
                  }
                  variant="outline"
                  spacing={8}
                  className="w-max min-w-full"
                >
                  <ToggleGroupItem
                    value={ALL_FILTER_VALUE}
                    className="h-8 rounded-full px-3 text-xs"
                  >
                    全部 Owner
                  </ToggleGroupItem>
                  {ownerSegmentItems}
                </ToggleGroup>
              </div>
            </TabsContent>

            <TabsContent value="cost" className="mt-2 text-foreground">
              <div className="overflow-x-auto pb-1">
                <ToggleGroup
                  type="single"
                  value={costRange ?? ALL_FILTER_VALUE}
                  onValueChange={(value) =>
                    onCostRangeChange(
                      value === ALL_FILTER_VALUE || value.length === 0 ? null : value,
                    )
                  }
                  variant="outline"
                  spacing={8}
                  className="w-max min-w-full"
                >
                  <ToggleGroupItem
                    value={ALL_FILTER_VALUE}
                    className="h-8 rounded-full px-3 text-xs"
                  >
                    全部成本
                  </ToggleGroupItem>
                  {TENANT_PROJECT_COST_RANGE_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      className="h-8 rounded-full px-3 text-xs"
                    >
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center gap-2">
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
              className="cursor-pointer font-normal text-muted-foreground hover:text-foreground"
            >
              重置
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 px-4 py-3">
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
      </div>
    </section>
  )
}
