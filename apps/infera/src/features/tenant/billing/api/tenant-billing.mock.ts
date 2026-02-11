import { delay, HttpResponse, http } from "msw"
import { mockRegistry } from "@/packages/mock-core"
import type {
  TenantBillingOverviewResponse,
  TenantBillingRange,
  TenantCostAllocationGroup,
  TenantCostAllocationResponse,
  TenantInvoiceDetailResponse,
  TenantInvoiceItem,
  TenantPaymentMethodsResponse,
} from "../types/tenant-billing"
import { TENANT_BILLING_SEEDS } from "./tenant-billing.mock.seed"

function getTenantBillingSeed(tenantId: string) {
  const current = TENANT_BILLING_SEEDS[tenantId]
  if (current) {
    return current
  }

  const fallback = TENANT_BILLING_SEEDS["1"]
  if (fallback) {
    return fallback
  }

  throw new Error("TENANT_BILLING_SEEDS requires a default tenant seed.")
}

function parsePositiveInt(rawValue: string | null, fallback: number) {
  if (!rawValue) {
    return fallback
  }
  const parsed = Number.parseInt(rawValue, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }
  return parsed
}

function parseRange(rawValue: string | null): TenantBillingRange {
  if (rawValue === "7d") {
    return "7d"
  }
  return "30d"
}

function parseGroupBy(rawValue: string | null): TenantCostAllocationGroup {
  if (rawValue === "api_key" || rawValue === "service") {
    return rawValue
  }
  return "project"
}

function cloneInvoice(invoice: TenantInvoiceItem): TenantInvoiceItem {
  return { ...invoice }
}

function cloneInvoiceDetail(detail: TenantInvoiceDetailResponse): TenantInvoiceDetailResponse {
  return {
    invoice: cloneInvoice(detail.invoice),
    subtotalCny: detail.subtotalCny,
    taxCny: detail.taxCny,
    totalCny: detail.totalCny,
    lineItems: detail.lineItems.map((lineItem) => ({
      ...lineItem,
    })),
  }
}

function cloneOverview(overview: TenantBillingOverviewResponse): TenantBillingOverviewResponse {
  return {
    summary: {
      ...overview.summary,
    },
    costTrend: overview.costTrend.map((point) => ({
      ...point,
    })),
    costComposition: overview.costComposition.map((item) => ({
      ...item,
    })),
    updatedAt: overview.updatedAt,
  }
}

function clonePaymentMethods(payload: TenantPaymentMethodsResponse): TenantPaymentMethodsResponse {
  return {
    methods: payload.methods.map((method) => ({
      ...method,
    })),
  }
}

function buildCostAllocationResponse(
  seedRows: TenantCostAllocationResponse["rows"],
  groupBy: TenantCostAllocationGroup,
  range: TenantBillingRange,
): TenantCostAllocationResponse {
  const ratio = range === "7d" ? 0.28 : 1
  const rows = seedRows.map((row) => ({
    ...row,
    costCny: Number((row.costCny * ratio).toFixed(2)),
    tokens: Math.floor(row.tokens * ratio),
    requests: Math.floor(row.requests * ratio),
  }))

  const totalCostCny = Number(rows.reduce((acc, row) => acc + row.costCny, 0).toFixed(2))
  const normalizedRows = rows.map((row) => ({
    ...row,
    shareRate: totalCostCny > 0 ? Number((row.costCny / totalCostCny).toFixed(4)) : 0,
  }))

  return {
    groupBy,
    range,
    totalCostCny,
    generatedAt: "2026-02-10T15:30:00Z",
    rows: normalizedRows,
  }
}

export const tenantBillingHandlers = [
  http.get("*/infera-api/tenants/:tenantId/billing/overview", async ({ params, request }) => {
    await delay(260)
    const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
    const seed = getTenantBillingSeed(tenantId)
    const url = new URL(request.url)
    const range = parseRange(url.searchParams.get("range"))

    return HttpResponse.json(cloneOverview(seed.overviewByRange[range]))
  }),
  http.get("*/infera-api/tenants/:tenantId/billing/invoices", async ({ params, request }) => {
    await delay(280)
    const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
    const seed = getTenantBillingSeed(tenantId)
    const url = new URL(request.url)

    const statusFilter = url.searchParams.get("status")
    const pageNumber = parsePositiveInt(url.searchParams.get("pageNumber"), 1)
    const pageSize = parsePositiveInt(url.searchParams.get("pageSize"), 10)

    const filtered = seed.invoices.filter((invoice) => {
      if (!statusFilter) {
        return true
      }
      return invoice.status === statusFilter
    })

    const totalElements = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalElements / pageSize))
    const safePage = Math.min(pageNumber, totalPages)
    const offset = (safePage - 1) * pageSize
    const content = filtered
      .slice(offset, offset + pageSize)
      .map((invoice) => cloneInvoice(invoice))

    return HttpResponse.json({
      pageNumber: safePage,
      pageSize,
      totalElements,
      totalPages,
      content,
    })
  }),
  http.get("*/infera-api/tenants/:tenantId/billing/invoices/:invoiceId", async ({ params }) => {
    await delay(220)
    const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
    const invoiceId = typeof params.invoiceId === "string" ? params.invoiceId : ""
    const seed = getTenantBillingSeed(tenantId)

    const invoice = seed.invoices.find((item) => item.invoiceId === invoiceId)
    const detail = seed.invoiceDetails[invoiceId]

    if (!invoice || !detail) {
      return HttpResponse.json(
        {
          title: "not_found",
          detail: "invoice not found",
        },
        { status: 404 },
      )
    }

    const payload = cloneInvoiceDetail({
      invoice: cloneInvoice(invoice),
      ...detail,
    })

    return HttpResponse.json(payload)
  }),
  http.get("*/infera-api/tenants/:tenantId/billing/payment-methods", async ({ params }) => {
    await delay(200)
    const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
    const seed = getTenantBillingSeed(tenantId)
    return HttpResponse.json(
      clonePaymentMethods({
        methods: seed.paymentMethods,
      }),
    )
  }),
  http.get(
    "*/infera-api/tenants/:tenantId/billing/cost-allocation",
    async ({ params, request }) => {
      await delay(260)
      const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
      const seed = getTenantBillingSeed(tenantId)
      const url = new URL(request.url)
      const range = parseRange(url.searchParams.get("range"))
      const groupBy = parseGroupBy(url.searchParams.get("groupBy"))
      const rows = seed.costAllocationRows[groupBy]

      return HttpResponse.json(buildCostAllocationResponse(rows, groupBy, range))
    },
  ),
]

mockRegistry.register(...tenantBillingHandlers)
