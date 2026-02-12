import { Gauge, History, RefreshCcw, Wallet } from "lucide-react"
import { type ComponentType, type SVGProps, useMemo, useState } from "react"
import { toast } from "sonner"
import { getHttpErrorMessage } from "@/features/core/api"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { isApiError } from "@/packages/error-core"
import { ContentLayout } from "@/packages/layout-core"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/packages/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs"
import {
  useTenantPolicyHistoryQuery,
  useTenantQuotasBudgetsQuery,
  useUpdateTenantBudgetsPolicy,
  useUpdateTenantQuotasPolicy,
} from "../hooks"
import {
  formatCurrency,
  formatDateTime,
  formatPercent,
} from "../utils/tenant-quotas-budgets-formatters"
import { TenantBudgetsTab } from "./tenant-budgets-tab"
import { TenantPolicyHistoryTab } from "./tenant-policy-history-tab"
import { TenantQuotasTab } from "./tenant-quotas-tab"

interface TenantQuotasBudgetsPageProps {
  tenantId: string
}

const TAB_VALUES = ["quotas", "budgets", "policy-history"] as const

type QuotasBudgetsTab = (typeof TAB_VALUES)[number]

function toErrorMessage(error: unknown) {
  if (isApiError(error)) {
    return getHttpErrorMessage(error)
  }

  if (error instanceof Error) {
    return error.message
  }

  return "操作失败，请稍后重试。"
}

export function TenantQuotasBudgetsPage({ tenantId }: TenantQuotasBudgetsPageProps) {
  const [activeTab, setActiveTab] = useState<QuotasBudgetsTab>("quotas")

  const quotasBudgetsQuery = useTenantQuotasBudgetsQuery({
    tenantId,
  })
  const policyHistoryQuery = useTenantPolicyHistoryQuery({
    tenantId,
  })

  const updateQuotasMutation = useUpdateTenantQuotasPolicy()
  const updateBudgetsMutation = useUpdateTenantBudgetsPolicy()

  const data = quotasBudgetsQuery.data
  const refetchQuotasBudgets = () => {
    void quotasBudgetsQuery.refetch()
  }
  const refetchPolicyHistory = () => {
    void policyHistoryQuery.refetch()
  }
  const refetchAll = () => {
    refetchQuotasBudgets()
    refetchPolicyHistory()
  }

  const statusCards = useMemo(() => {
    if (!data) {
      return [] as Array<{
        key: string
        title: string
        icon: ComponentType<SVGProps<SVGSVGElement>>
        lines: string[]
      }>
    }

    return [
      {
        key: "quotas",
        title: "配额策略",
        icon: Gauge,
        lines: [
          `当前模式：${data.quotasPolicy.mode === "advanced" ? "JSON 高级" : "简单模式"}`,
          `最近更新：${formatDateTime(data.quotasPolicy.updatedAt)}`,
        ],
      },
      {
        key: "budgets",
        title: "预算策略",
        icon: Wallet,
        lines: [
          `日预算：${formatCurrency(data.budgetsPolicy.dailyBudgetCny)} / 月预算：${formatCurrency(data.budgetsPolicy.monthlyBudgetCny)}`,
          `告警阈值：${data.budgetsPolicy.alertThresholds.map((item) => formatPercent(item)).join(" / ")}`,
        ],
      },
      {
        key: "history",
        title: "策略历史",
        icon: History,
        lines: [
          `最近变更：${data.budgetsPolicy.updatedBy}`,
          `记录总数：${policyHistoryQuery.data?.items.length ?? 0}`,
        ],
      },
    ]
  }, [data, policyHistoryQuery.data?.items.length])

  const actions = (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="cursor-pointer"
      disabled={quotasBudgetsQuery.isFetching || policyHistoryQuery.isFetching}
      onClick={refetchAll}
    >
      <RefreshCcw
        className={
          quotasBudgetsQuery.isFetching || policyHistoryQuery.isFetching
            ? "size-4 animate-spin"
            : "size-4"
        }
        aria-hidden
      />
      刷新
    </Button>
  )

  return (
    <ContentLayout
      title="配额与预算"
      description="配置租户资源上限、预算阈值与超限动作，确保成本与容量在可控范围内。"
      actions={actions}
    >
      {quotasBudgetsQuery.isPending ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <Card key={item} className="h-28 border-border/50 py-0">
              <CardContent className="h-full animate-pulse rounded-lg bg-muted/40" />
            </Card>
          ))}
        </div>
      ) : null}

      {quotasBudgetsQuery.isError ? (
        <ErrorState
          title="配额与预算加载失败"
          message="无法获取租户配额与预算策略，请稍后重试。"
          error={quotasBudgetsQuery.error}
          onRetry={refetchQuotasBudgets}
        />
      ) : null}

      {!quotasBudgetsQuery.isPending && !quotasBudgetsQuery.isError && !data ? (
        <EmptyState
          icon={Gauge}
          title="暂无配额与预算策略"
          description="当前租户尚未初始化策略，请稍后刷新查看。"
          primaryAction={{
            label: "立即刷新",
            onClick: refetchQuotasBudgets,
          }}
        />
      ) : null}

      {!quotasBudgetsQuery.isPending && !quotasBudgetsQuery.isError && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            {statusCards.map((item) => {
              const Icon = item.icon

              return (
                <Card
                  key={item.key}
                  className="border-border/50 bg-gradient-to-br from-card to-muted/25 py-0"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Icon className="size-4 text-muted-foreground" aria-hidden />
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 pb-4 text-xs text-muted-foreground">
                    {item.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </section>

          <section className="flex flex-wrap items-center gap-2">
            <Badge variant={data.capabilities.canEditQuotas ? "default" : "secondary"}>
              配额编辑：{data.capabilities.canEditQuotas ? "可用" : "只读"}
            </Badge>
            <Badge variant={data.capabilities.canEditBudgets ? "default" : "secondary"}>
              预算编辑：{data.capabilities.canEditBudgets ? "可用" : "只读"}
            </Badge>
            <Badge variant={data.capabilities.canUseAdvancedMode ? "default" : "secondary"}>
              JSON 高级模式：{data.capabilities.canUseAdvancedMode ? "可用" : "不可用"}
            </Badge>
          </section>

          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              if (TAB_VALUES.includes(value as QuotasBudgetsTab)) {
                setActiveTab(value as QuotasBudgetsTab)
              }
            }}
            className="space-y-4"
          >
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="quotas" className="cursor-pointer px-4">
                Quotas
              </TabsTrigger>
              <TabsTrigger value="budgets" className="cursor-pointer px-4">
                Budgets
              </TabsTrigger>
              <TabsTrigger value="policy-history" className="cursor-pointer px-4">
                Policy History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quotas" className="border-none p-0 outline-none">
              <TenantQuotasTab
                tenantId={tenantId}
                policy={data.quotasPolicy}
                capabilities={data.capabilities}
                submitting={updateQuotasMutation.isPending}
                onSubmit={async (input) => {
                  try {
                    await updateQuotasMutation.mutateAsync(input)
                    toast.success("配额策略已保存")
                  } catch (error) {
                    toast.error(toErrorMessage(error))
                    throw error
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="budgets" className="border-none p-0 outline-none">
              <TenantBudgetsTab
                tenantId={tenantId}
                policy={data.budgetsPolicy}
                capabilities={data.capabilities}
                submitting={updateBudgetsMutation.isPending}
                onSubmit={async (input) => {
                  try {
                    await updateBudgetsMutation.mutateAsync(input)
                    toast.success("预算策略已保存")
                  } catch (error) {
                    toast.error(toErrorMessage(error))
                    throw error
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="policy-history" className="border-none p-0 outline-none">
              <TenantPolicyHistoryTab
                items={policyHistoryQuery.data?.items ?? []}
                pending={policyHistoryQuery.isPending}
                error={policyHistoryQuery.isError ? policyHistoryQuery.error : null}
                refreshing={policyHistoryQuery.isFetching}
                onRetry={refetchPolicyHistory}
              />
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </ContentLayout>
  )
}
