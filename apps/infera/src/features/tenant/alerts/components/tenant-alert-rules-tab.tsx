import { Plus, RefreshCcw, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Skeleton } from "@/packages/ui/skeleton"
import { Switch } from "@/packages/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { useTenantAlertRulesQuery } from "../hooks"
import {
  TENANT_ALERT_TYPES,
  type TenantAlertRuleItem,
  type UpsertTenantAlertRulePayload,
} from "../types/tenant-alerts"
import {
  formatAlertType,
  formatDateTime,
  formatNumberWithUnit,
  formatOverageAction,
} from "../utils/tenant-alerts-formatters"
import { TenantAlertRuleSheet } from "./tenant-alert-rule-sheet"

interface TenantAlertRulesTabProps {
  tenantId: string
  onCreateRule: (payload: UpsertTenantAlertRulePayload) => Promise<void>
  onUpdateRule: (ruleId: string, payload: UpsertTenantAlertRulePayload) => Promise<void>
  onToggleRule: (ruleId: string, enabled: boolean) => Promise<void>
  onDeleteRule: (ruleId: string) => Promise<void>
  updating: boolean
  toggling: boolean
  deleting: boolean
}

function RulesLoadingState() {
  return (
    <div className="space-y-2 rounded-lg border border-border/50 bg-card p-4">
      {[0, 1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-10 w-full" />
      ))}
    </div>
  )
}

function formatCondition(rule: TenantAlertRuleItem) {
  return `${rule.condition.metric} ${rule.condition.operator} ${formatNumberWithUnit(rule.condition.threshold, rule.condition.unit)}，持续 ${rule.condition.durationMinutes} 分钟`
}

export function TenantAlertRulesTab({
  tenantId,
  onCreateRule,
  onUpdateRule,
  onToggleRule,
  onDeleteRule,
  updating,
  toggling,
  deleting,
}: TenantAlertRulesTabProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<TenantAlertRuleItem | null>(null)
  const [typeFilter, setTypeFilter] = useState<"all" | (typeof TENANT_ALERT_TYPES)[number]>("all")
  const [enabledFilter, setEnabledFilter] = useState<"all" | "enabled" | "disabled">("all")

  const query = useTenantAlertRulesQuery({
    tenantId,
  })

  const rules = query.data?.items ?? []
  const projectOptions = query.data?.projectOptions ?? []
  const serviceOptions = query.data?.serviceOptions ?? []

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      if (typeFilter !== "all" && rule.type !== typeFilter) {
        return false
      }
      if (enabledFilter === "enabled" && !rule.enabled) {
        return false
      }
      if (enabledFilter === "disabled" && rule.enabled) {
        return false
      }
      return true
    })
  }, [enabledFilter, rules, typeFilter])

  if (query.isPending) {
    return <RulesLoadingState />
  }

  if (query.isError) {
    return (
      <ErrorState
        title="告警规则加载失败"
        message="无法读取告警规则，请稍后重试。"
        error={query.error}
        onRetry={() => {
          void query.refetch()
        }}
      />
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">已启用 {rules.filter((item) => item.enabled).length}</Badge>
            <Badge variant="outline">总计 {rules.length}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={typeFilter}
              onValueChange={(value: "all" | (typeof TENANT_ALERT_TYPES)[number]) => {
                setTypeFilter(value)
              }}
            >
              <SelectTrigger className="w-[160px] cursor-pointer">
                <SelectValue placeholder="类型筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  全部类型
                </SelectItem>
                {TENANT_ALERT_TYPES.map((type) => (
                  <SelectItem key={type} value={type} className="cursor-pointer">
                    {formatAlertType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={enabledFilter}
              onValueChange={(value: "all" | "enabled" | "disabled") => {
                setEnabledFilter(value)
              }}
            >
              <SelectTrigger className="w-[160px] cursor-pointer">
                <SelectValue placeholder="启用状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  全部状态
                </SelectItem>
                <SelectItem value="enabled" className="cursor-pointer">
                  仅已启用
                </SelectItem>
                <SelectItem value="disabled" className="cursor-pointer">
                  仅已禁用
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={query.isFetching}
              onClick={() => {
                void query.refetch()
              }}
            >
              <RefreshCcw className={query.isFetching ? "size-4 animate-spin" : "size-4"} />
              刷新
            </Button>

            <Button
              type="button"
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                setEditingRule(null)
                setSheetOpen(true)
              }}
            >
              <Plus className="size-4" />
              创建规则
            </Button>
          </div>
        </div>

        {filteredRules.length === 0 ? (
          <EmptyState title="暂无告警规则" description="可以创建第一条告警规则来监控租户风险。" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>规则名</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>作用范围</TableHead>
                  <TableHead>条件</TableHead>
                  <TableHead>通知渠道</TableHead>
                  <TableHead>超限动作</TableHead>
                  <TableHead>启用</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule.ruleId}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{formatAlertType(rule.type)}</TableCell>
                    <TableCell className="max-w-[240px] truncate text-muted-foreground text-xs">
                      {rule.scopeLabel}
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate font-mono text-xs">
                      {formatCondition(rule)}
                    </TableCell>
                    <TableCell className="text-xs">{rule.channels.join(" / ")}</TableCell>
                    <TableCell className="text-xs">
                      {formatOverageAction(rule.overageAction)}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.enabled}
                        disabled={toggling}
                        onCheckedChange={(checked) => {
                          void onToggleRule(rule.ruleId, checked)
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(rule.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => {
                            setEditingRule(rule)
                            setSheetOpen(true)
                          }}
                        >
                          编辑
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer text-destructive"
                          disabled={deleting}
                          onClick={() => {
                            const confirmed = window.confirm(`确认删除规则「${rule.name}」吗？`)
                            if (!confirmed) {
                              return
                            }
                            void onDeleteRule(rule.ruleId)
                          }}
                        >
                          <Trash2 className="size-4" />
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <TenantAlertRuleSheet
        open={sheetOpen}
        editingRule={editingRule}
        projectOptions={projectOptions}
        serviceOptions={serviceOptions}
        submitting={updating}
        onOpenChange={setSheetOpen}
        onSubmit={async (payload) => {
          if (editingRule) {
            await onUpdateRule(editingRule.ruleId, payload)
          } else {
            await onCreateRule(payload)
          }
          setSheetOpen(false)
        }}
      />
    </>
  )
}
