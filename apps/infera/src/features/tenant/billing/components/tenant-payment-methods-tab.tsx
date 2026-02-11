import { CreditCard, Landmark, ShieldCheck } from "lucide-react"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { Badge } from "@/packages/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import { Skeleton } from "@/packages/ui/skeleton"
import { useTenantPaymentMethodsQuery } from "../hooks/use-tenant-payment-methods-query"
import type { TenantPaymentMethodItem } from "../types/tenant-billing"
import { formatDateTime, getPaymentMethodStatusLabel } from "../utils/tenant-billing-formatters"

interface TenantPaymentMethodsTabProps {
  tenantId: string
}

function getStatusClassName(status: TenantPaymentMethodItem["status"]) {
  if (status === "Active") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
  }
  if (status === "Expired") {
    return "border-destructive/20 bg-destructive/10 text-destructive"
  }
  return "border-amber-500/20 bg-amber-500/10 text-amber-500"
}

function PaymentMethodsLoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[0, 1].map((item) => (
        <Card key={item} className="border-border/50 py-0">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TenantPaymentMethodsTab({ tenantId }: TenantPaymentMethodsTabProps) {
  const methodsQuery = useTenantPaymentMethodsQuery({ tenantId })

  if (methodsQuery.isPending) {
    return <PaymentMethodsLoadingState />
  }

  if (methodsQuery.isError) {
    return (
      <ErrorState
        title="支付方式加载失败"
        message="无法获取 Payment Methods 数据，请稍后重试。"
        error={methodsQuery.error}
        onRetry={() => {
          void methodsQuery.refetch()
        }}
      />
    )
  }

  const methods = methodsQuery.data?.methods ?? []

  if (methods.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="暂无支付方式"
        description="当前租户还没有配置可用的支付方式。"
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {methods.map((method) => (
        <Card
          key={method.methodId}
          className="border-border/50 py-0 transition-all duration-200 hover:bg-muted/20"
        >
          <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/50 px-4 py-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                {method.type === "Card" ? (
                  <CreditCard className="size-4 text-muted-foreground" aria-hidden />
                ) : (
                  <Landmark className="size-4 text-muted-foreground" aria-hidden />
                )}
                {method.type === "Card"
                  ? `${method.brand ?? "Card"} •••• ${method.last4 ?? "----"}`
                  : `Bank Transfer •••• ${method.last4 ?? "----"}`}
              </CardTitle>
              <CardDescription>{method.holderName}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {method.isDefault ? (
                <Badge variant="secondary" className="text-xs">
                  默认
                </Badge>
              ) : null}
              <Badge
                variant="outline"
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusClassName(method.status)}`}
              >
                {getPaymentMethodStatusLabel(method.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-4 py-4">
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-muted-foreground">账单邮箱</span>
              <span className="font-medium text-foreground">{method.billingEmail}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-muted-foreground">到期时间</span>
              <span className="font-mono text-foreground">
                {method.expiresAt ? formatDateTime(method.expiresAt) : "长期有效"}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-500" aria-hidden />
              支付信息仅用于账单扣费，不会暴露到项目侧业务面板。
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
