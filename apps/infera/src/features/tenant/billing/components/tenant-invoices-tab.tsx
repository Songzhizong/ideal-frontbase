import { Download, Eye, RefreshCcw } from "lucide-react"
import { useMemo, useState } from "react"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Skeleton } from "@/packages/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { useTenantBillingInvoicesQuery } from "../hooks/use-tenant-billing-invoices-query"
import type { TenantInvoiceItem, TenantInvoiceStatus } from "../types/tenant-billing"
import {
  downloadCsv,
  formatBillingPeriod,
  formatCurrency,
  formatDateTime,
  getInvoiceStatusLabel,
} from "../utils/tenant-billing-formatters"
import { TenantInvoiceDetailDialog } from "./tenant-invoice-detail-dialog"

interface TenantInvoicesTabProps {
  tenantId: string
}

const STATUS_FILTER_OPTIONS: ReadonlyArray<{ value: "all" | TenantInvoiceStatus; label: string }> =
  [
    {
      value: "all",
      label: "全部状态",
    },
    {
      value: "Paid",
      label: "已支付",
    },
    {
      value: "Unpaid",
      label: "待支付",
    },
    {
      value: "Overdue",
      label: "已逾期",
    },
  ]

function getInvoiceStatusClassName(status: TenantInvoiceStatus) {
  if (status === "Paid") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
  }
  if (status === "Unpaid") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-500"
  }
  return "border-destructive/20 bg-destructive/10 text-destructive"
}

function InvoiceStatusBadge({ status }: { status: TenantInvoiceStatus }) {
  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getInvoiceStatusClassName(status)}`}
    >
      {getInvoiceStatusLabel(status)}
    </Badge>
  )
}

function InvoicesLoadingState() {
  return (
    <div className="space-y-2 rounded-lg border border-border/50 bg-card p-4">
      {[0, 1, 2, 3, 4].map((item) => (
        <Skeleton key={item} className="h-10 w-full" />
      ))}
    </div>
  )
}

function buildInvoicesCsvRows(invoices: readonly TenantInvoiceItem[]) {
  return [
    ["账期", "金额(CNY)", "状态", "出账时间", "到期时间", "支付时间"],
    ...invoices.map((invoice) => [
      formatBillingPeriod(invoice.periodStart, invoice.periodEnd),
      String(invoice.amountCny),
      getInvoiceStatusLabel(invoice.status),
      formatDateTime(invoice.issuedAt),
      invoice.dueAt ? formatDateTime(invoice.dueAt) : "-",
      invoice.paidAt ? formatDateTime(invoice.paidAt) : "-",
    ]),
  ]
}

export function TenantInvoicesTab({ tenantId }: TenantInvoicesTabProps) {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<"all" | TenantInvoiceStatus>("all")
  const [detailInvoiceId, setDetailInvoiceId] = useState<string | null>(null)

  const invoicesQuery = useTenantBillingInvoicesQuery({
    tenantId,
    page,
    size: 10,
    status: statusFilter === "all" ? null : statusFilter,
  })

  const invoices = invoicesQuery.data?.content ?? []
  const totalPages = invoicesQuery.data?.totalPages ?? 1

  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  const pageLabel = useMemo(() => {
    const total = invoicesQuery.data?.totalElements ?? 0
    if (total === 0) {
      return "0 / 0"
    }
    const start = (page - 1) * 10 + 1
    const end = Math.min(page * 10, total)
    return `${start}-${end} / ${total}`
  }, [invoicesQuery.data?.totalElements, page])

  if (invoicesQuery.isPending) {
    return <InvoicesLoadingState />
  }

  if (invoicesQuery.isError) {
    return (
      <ErrorState
        title="发票列表加载失败"
        message="无法获取发票账期数据，请稍后重试。"
        error={invoicesQuery.error}
        onRetry={() => {
          void invoicesQuery.refetch()
        }}
      />
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (
                  value === "all" ||
                  value === "Paid" ||
                  value === "Unpaid" ||
                  value === "Overdue"
                ) {
                  setStatusFilter(value)
                  setPage(1)
                }
              }}
            >
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                downloadCsv("tenant-invoices.csv", buildInvoicesCsvRows(invoices))
              }}
              disabled={invoices.length === 0}
              className="cursor-pointer"
            >
              <Download className="size-4" aria-hidden />
              导出 CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void invoicesQuery.refetch()
              }}
              disabled={invoicesQuery.isFetching}
              className="cursor-pointer"
            >
              <RefreshCcw
                className={invoicesQuery.isFetching ? "size-4 animate-spin" : "size-4"}
                aria-hidden
              />
              刷新
            </Button>
          </div>
        </div>

        {invoices.length === 0 ? (
          <EmptyState title="暂无发票记录" description="当前筛选条件下没有账期发票。" />
        ) : (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      账期
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      金额
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      状态
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      出账时间
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.invoiceId}>
                      <TableCell className="font-medium">
                        {formatBillingPeriod(invoice.periodStart, invoice.periodEnd)}
                      </TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">
                        {formatCurrency(invoice.amountCny)}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDateTime(invoice.issuedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            asChild
                          >
                            <a href={invoice.downloadUrl} target="_blank" rel="noreferrer">
                              <Download className="size-4" aria-hidden />
                              下载
                            </a>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailInvoiceId(invoice.invoiceId)}
                            className="cursor-pointer"
                          >
                            <Eye className="size-4" aria-hidden />
                            明细
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">当前显示 {pageLabel}</p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!canGoPrev}
                  className="cursor-pointer"
                >
                  上一页
                </Button>
                <span className="font-mono text-xs text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={!canGoNext}
                  className="cursor-pointer"
                >
                  下一页
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <TenantInvoiceDetailDialog
        tenantId={tenantId}
        invoiceId={detailInvoiceId}
        open={detailInvoiceId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetailInvoiceId(null)
          }
        }}
      />
    </>
  )
}
