import { Download } from "lucide-react"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { Button } from "@/packages/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"
import { Skeleton } from "@/packages/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { useTenantInvoiceDetailQuery } from "../hooks/use-tenant-invoice-detail-query"
import {
  downloadCsv,
  formatBillingPeriod,
  formatCurrency,
} from "../utils/tenant-billing-formatters"

interface TenantInvoiceDetailDialogProps {
  tenantId: string
  invoiceId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function InvoiceDetailLoadingState() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-18 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function TenantInvoiceDetailDialog({
  tenantId,
  invoiceId,
  open,
  onOpenChange,
}: TenantInvoiceDetailDialogProps) {
  const detailQuery = useTenantInvoiceDetailQuery({
    tenantId,
    invoiceId: invoiceId ?? "",
    enabled: open && invoiceId !== null,
  })

  const detail = detailQuery.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>账期详情</DialogTitle>
          <DialogDescription>
            {detail
              ? `账期 ${formatBillingPeriod(detail.invoice.periodStart, detail.invoice.periodEnd)}`
              : "查看账期成本构成与可导出明细。"}
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isPending ? <InvoiceDetailLoadingState /> : null}

        {detailQuery.isError ? (
          <ErrorState
            title="账期详情加载失败"
            message="无法获取账期明细，请稍后重试。"
            error={detailQuery.error}
            onRetry={() => {
              void detailQuery.refetch()
            }}
          />
        ) : null}

        {!detailQuery.isPending && !detailQuery.isError && detail ? (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-lg border border-border/50 bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">发票 ID</p>
                <p className="mt-1 font-mono text-xs text-foreground">{detail.invoice.invoiceId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">账期总额</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {formatCurrency(detail.totalCny)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">未税金额</p>
                <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
                  {formatCurrency(detail.subtotalCny)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">税费</p>
                <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
                  {formatCurrency(detail.taxCny)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">成本构成明细</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csvRows = [
                      ["分类", "描述", "数量", "单位", "单价(CNY)", "金额(CNY)"],
                      ...detail.lineItems.map((lineItem) => [
                        lineItem.category,
                        lineItem.description,
                        String(lineItem.quantity),
                        lineItem.unit,
                        String(lineItem.unitPriceCny),
                        String(lineItem.amountCny),
                      ]),
                    ]
                    downloadCsv(`${detail.invoice.invoiceId}-detail.csv`, csvRows)
                  }}
                  className="cursor-pointer"
                >
                  <Download className="size-4" aria-hidden />
                  导出 CSV
                </Button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border/50">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        分类
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        描述
                      </TableHead>
                      <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        数量
                      </TableHead>
                      <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        单价
                      </TableHead>
                      <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        金额
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.lineItems.map((lineItem) => (
                      <TableRow key={lineItem.lineId}>
                        <TableCell>{lineItem.category}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {lineItem.description}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          {lineItem.quantity}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          {formatCurrency(lineItem.unitPriceCny)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          {formatCurrency(lineItem.amountCny)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : null}

        {!detailQuery.isPending && !detailQuery.isError && !detail ? (
          <EmptyState
            title="未找到账期详情"
            description="当前账期数据不存在，可能已过期或被删除。"
          />
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
