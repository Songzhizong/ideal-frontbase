import type {
  TenantBillingCostCompositionItem,
  TenantBillingOverviewResponse,
  TenantBillingRange,
  TenantCostAllocationGroup,
  TenantCostAllocationItem,
  TenantInvoiceDetailResponse,
  TenantInvoiceItem,
  TenantPaymentMethodItem,
} from "../types/tenant-billing"
import {
  TENANT_1_COMPOSITION,
  TENANT_1_COST_ALLOCATION,
  TENANT_1_INVOICES,
  TENANT_1_PAYMENT_METHODS,
  TENANT_1_SUMMARY,
} from "./tenant-billing.mock.seed.tenant1"
import {
  TENANT_2_COMPOSITION,
  TENANT_2_COST_ALLOCATION,
  TENANT_2_INVOICES,
  TENANT_2_PAYMENT_METHODS,
  TENANT_2_SUMMARY,
} from "./tenant-billing.mock.seed.tenant2"

interface TenantBillingSeed {
  overviewByRange: Record<TenantBillingRange, TenantBillingOverviewResponse>
  invoices: TenantInvoiceItem[]
  invoiceDetails: Record<string, Omit<TenantInvoiceDetailResponse, "invoice">>
  paymentMethods: TenantPaymentMethodItem[]
  costAllocationRows: Record<TenantCostAllocationGroup, TenantCostAllocationItem[]>
}

function buildTrendData(points: number, baseCost: number, stepCost: number) {
  return Array.from({ length: points }, (_, index) => {
    const growth = 1 + index * 0.012
    const costCny = Number((baseCost + stepCost * index).toFixed(2))
    const tokens = Math.round(costCny * 24500 * growth)
    const requests = Math.round(costCny * 11.2)

    return {
      timestamp: `2026-01-${String(index + 1).padStart(2, "0")}T00:00:00Z`,
      costCny,
      tokens,
      requests,
      gpuHours: Number((costCny / 42).toFixed(2)),
    }
  })
}

function buildOverview(
  range: TenantBillingRange,
  summary: TenantBillingOverviewResponse["summary"],
  baseCost: number,
  stepCost: number,
  composition: readonly TenantBillingCostCompositionItem[],
): TenantBillingOverviewResponse {
  const points = range === "7d" ? 7 : 30
  return {
    summary,
    costTrend: buildTrendData(points, baseCost, stepCost),
    costComposition: [...composition],
    updatedAt: "2026-02-10T15:30:00Z",
  }
}

function buildInvoiceDetail(totalCny: number): Omit<TenantInvoiceDetailResponse, "invoice"> {
  const subtotalCny = Number((totalCny / 1.06).toFixed(2))
  const taxCny = Number((totalCny - subtotalCny).toFixed(2))

  return {
    subtotalCny,
    taxCny,
    totalCny,
    lineItems: [
      {
        lineId: "line-tokens",
        category: "Tokens",
        description: "推理请求（Prompt + Completion）",
        quantity: Math.round(totalCny * 2480),
        unit: "token",
        unitPriceCny: 0.00022,
        amountCny: Number((totalCny * 0.52).toFixed(2)),
      },
      {
        lineId: "line-gpu",
        category: "GPU Hours",
        description: "A100 80G 在线时长",
        quantity: Number((totalCny / 22).toFixed(2)),
        unit: "gpu-hour",
        unitPriceCny: 21.8,
        amountCny: Number((totalCny * 0.4).toFixed(2)),
      },
      {
        lineId: "line-storage",
        category: "Storage",
        description: "模型与日志存储",
        quantity: 1,
        unit: "month",
        unitPriceCny: Number((subtotalCny * 0.08).toFixed(2)),
        amountCny: Number((subtotalCny * 0.08).toFixed(2)),
      },
    ],
  }
}

function buildInvoiceDetails(invoices: readonly TenantInvoiceItem[]) {
  return Object.fromEntries(
    invoices.map((invoice) => [invoice.invoiceId, buildInvoiceDetail(invoice.amountCny)]),
  ) as Record<string, Omit<TenantInvoiceDetailResponse, "invoice">>
}

export const TENANT_BILLING_SEEDS: Readonly<Record<string, TenantBillingSeed>> = {
  "1": {
    overviewByRange: {
      "7d": buildOverview("7d", TENANT_1_SUMMARY, 1588, 92, TENANT_1_COMPOSITION),
      "30d": buildOverview("30d", TENANT_1_SUMMARY, 1230, 59, TENANT_1_COMPOSITION),
    },
    invoices: TENANT_1_INVOICES,
    invoiceDetails: buildInvoiceDetails(TENANT_1_INVOICES),
    paymentMethods: TENANT_1_PAYMENT_METHODS,
    costAllocationRows: TENANT_1_COST_ALLOCATION,
  },
  "2": {
    overviewByRange: {
      "7d": buildOverview("7d", TENANT_2_SUMMARY, 792, 79, TENANT_2_COMPOSITION),
      "30d": buildOverview("30d", TENANT_2_SUMMARY, 680, 21, TENANT_2_COMPOSITION),
    },
    invoices: TENANT_2_INVOICES,
    invoiceDetails: buildInvoiceDetails(TENANT_2_INVOICES),
    paymentMethods: TENANT_2_PAYMENT_METHODS,
    costAllocationRows: TENANT_2_COST_ALLOCATION,
  },
}
