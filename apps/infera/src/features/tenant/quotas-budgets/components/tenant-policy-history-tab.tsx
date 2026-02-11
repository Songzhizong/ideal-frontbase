import { History, RefreshCcw } from "lucide-react"
import { useMemo, useState } from "react"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/packages/ui/card"
import { Input } from "@/packages/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { cn } from "@/packages/ui-utils"
import type {
  TenantPolicyHistoryItem,
  TenantPolicyHistoryType,
} from "../types/tenant-quotas-budgets"
import { formatDateTime, getPolicyTypeLabel } from "../utils/tenant-quotas-budgets-formatters"

interface TenantPolicyHistoryTabProps {
  items: TenantPolicyHistoryItem[]
  pending: boolean
  error: unknown
  refreshing: boolean
  onRetry: () => void
}

const POLICY_TYPE_FILTERS = ["all", "quotas", "budgets"] as const

type PolicyTypeFilter = (typeof POLICY_TYPE_FILTERS)[number]

function getPolicyTypeBadgeClassName(policyType: TenantPolicyHistoryType) {
  if (policyType === "quotas") {
    return "border-blue-500/20 bg-blue-500/10 text-blue-500"
  }

  return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
}

export function TenantPolicyHistoryTab({
  items,
  pending,
  error,
  refreshing,
  onRetry,
}: TenantPolicyHistoryTabProps) {
  const [typeFilter, setTypeFilter] = useState<PolicyTypeFilter>("all")
  const [keyword, setKeyword] = useState("")

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return items.filter((item) => {
      if (typeFilter !== "all" && item.policyType !== typeFilter) {
        return false
      }

      if (normalizedKeyword.length === 0) {
        return true
      }

      const searchSource =
        `${item.actorName} ${item.summary} ${item.changedFields.join(" ")}`.toLowerCase()
      return searchSource.includes(normalizedKeyword)
    })
  }, [items, keyword, typeFilter])

  if (pending) {
    return (
      <Card className="border-border/50 py-0">
        <CardHeader>
          <CardTitle className="text-sm">策略变更历史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="h-12 animate-pulse rounded-md bg-muted/40" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="策略历史加载失败"
        message="无法加载配额与预算策略历史，请稍后重试。"
        error={error}
        onRetry={onRetry}
      />
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="暂无策略历史"
        description="当前租户尚未产生配额或预算策略变更记录。"
      />
    )
  }

  return (
    <Card className="border-border/50 py-0">
      <CardHeader className="space-y-3 border-b border-border/50 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm">策略变更历史</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={refreshing}
            className="cursor-pointer"
            onClick={onRetry}
          >
            <RefreshCcw className={cn("size-4", refreshing && "animate-spin")} aria-hidden />
            刷新
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)]">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              if (POLICY_TYPE_FILTERS.includes(value as PolicyTypeFilter)) {
                setTypeFilter(value as PolicyTypeFilter)
              }
            }}
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="quotas">仅配额</SelectItem>
              <SelectItem value="budgets">仅预算</SelectItem>
            </SelectContent>
          </Select>

          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="cursor-text"
            placeholder="搜索 Actor / 摘要 / 字段"
          />
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={History}
            title="没有匹配记录"
            description="尝试调整筛选条件后再查看。"
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    时间
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    类型
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    Actor
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    变更摘要
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    字段
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border", getPolicyTypeBadgeClassName(item.policyType))}>
                        {getPolicyTypeLabel(item.policyType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">{item.actorName}</p>
                        <p className="text-xs text-muted-foreground">{item.actorType}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{item.summary}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.changedFields.map((field) => (
                          <Badge
                            key={`${item.id}-${field}`}
                            variant="secondary"
                            className="text-xs"
                          >
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
