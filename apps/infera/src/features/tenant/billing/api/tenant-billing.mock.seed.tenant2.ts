import type {
  TenantBillingCostCompositionItem,
  TenantBillingOverviewResponse,
  TenantCostAllocationGroup,
  TenantCostAllocationItem,
  TenantInvoiceItem,
  TenantPaymentMethodItem,
} from "../types/tenant-billing"

function buildInvoice(
  invoiceId: string,
  periodStart: string,
  periodEnd: string,
  amountCny: number,
  status: TenantInvoiceItem["status"],
  paidAt: string | null,
): TenantInvoiceItem {
  return {
    invoiceId,
    periodStart,
    periodEnd,
    issuedAt: `${periodEnd.slice(0, 7)}-01T03:00:00Z`,
    dueAt: `${periodEnd.slice(0, 7)}-08T15:59:59Z`,
    paidAt,
    currency: "CNY",
    amountCny,
    status,
    downloadUrl: `/mock-downloads/${invoiceId}.pdf`,
  }
}

function withShareRate(rows: readonly Omit<TenantCostAllocationItem, "shareRate">[]) {
  const totalCost = rows.reduce((acc, row) => acc + row.costCny, 0)
  return rows.map((row) => ({
    ...row,
    shareRate: totalCost > 0 ? Number((row.costCny / totalCost).toFixed(4)) : 0,
  }))
}

export const TENANT_2_SUMMARY: TenantBillingOverviewResponse["summary"] = {
  monthlyCostCny: 18792.36,
  monthlyBudgetCny: 36000,
  monthlyBudgetUsageRate: 0.522,
  tokensThisMonth: 658920420,
  requestsThisMonth: 356281,
  gpuHoursThisMonth: 439.2,
  avgLatencyMs: 518.7,
  successRate: 0.984,
}

export const TENANT_2_COMPOSITION: readonly TenantBillingCostCompositionItem[] = [
  { category: "模型推理 Tokens", amountCny: 10620.34, ratio: 0.5651 },
  { category: "GPU 运行时", amountCny: 5982.67, ratio: 0.3183 },
  { category: "存储与网络", amountCny: 2189.35, ratio: 0.1166 },
]

export const TENANT_2_INVOICES: TenantInvoiceItem[] = [
  buildInvoice(
    "inv-nebula-2026-01",
    "2026-01-01T00:00:00Z",
    "2026-01-31T23:59:59Z",
    18234.27,
    "Paid",
    "2026-02-04T11:20:00Z",
  ),
  buildInvoice(
    "inv-nebula-2025-12",
    "2025-12-01T00:00:00Z",
    "2025-12-31T23:59:59Z",
    16820.13,
    "Paid",
    "2026-01-05T07:12:00Z",
  ),
  buildInvoice(
    "inv-nebula-2025-11",
    "2025-11-01T00:00:00Z",
    "2025-11-30T23:59:59Z",
    15921.01,
    "Unpaid",
    null,
  ),
]

export const TENANT_2_PAYMENT_METHODS: TenantPaymentMethodItem[] = [
  {
    methodId: "pm-nebula-01",
    type: "BankTransfer",
    holderName: "Nebula Finance",
    brand: null,
    last4: "8899",
    expiresAt: null,
    billingEmail: "finance@nebula.ai",
    isDefault: true,
    status: "Active",
  },
]

export const TENANT_2_COST_ALLOCATION = {
  project: withShareRate([
    {
      allocationKey: "project-vision",
      displayName: "Vision Stack",
      costCny: 7329.02,
      tokens: 211330210,
      requests: 106103,
      avgLatencyMs: 528,
    },
    {
      allocationKey: "project-rag",
      displayName: "RAG Platform",
      costCny: 5825.63,
      tokens: 169252120,
      requests: 91210,
      avgLatencyMs: 487,
    },
    {
      allocationKey: "project-ops",
      displayName: "Ops Assistant",
      costCny: 3382.63,
      tokens: 98220030,
      requests: 53420,
      avgLatencyMs: 570,
    },
    {
      allocationKey: "project-eval",
      displayName: "Evaluation Hub",
      costCny: 2255.08,
      tokens: 65530110,
      requests: 35290,
      avgLatencyMs: 612,
    },
  ]),
  api_key: withShareRate([
    {
      allocationKey: "key-nebula-web",
      displayName: "nebula-web",
      costCny: 8080.82,
      tokens: 232100220,
      requests: 118210,
      avgLatencyMs: 501,
    },
    {
      allocationKey: "key-nebula-batch",
      displayName: "nebula-batch",
      costCny: 6389.4,
      tokens: 185222901,
      requests: 94220,
      avgLatencyMs: 544,
    },
    {
      allocationKey: "key-nebula-qa",
      displayName: "nebula-qa",
      costCny: 4322.14,
      tokens: 124890120,
      requests: 67680,
      avgLatencyMs: 593,
    },
  ]),
  service: withShareRate([
    {
      allocationKey: "svc-nebula-chat",
      displayName: "chat-nebula-prod",
      costCny: 8644.48,
      tokens: 249300120,
      requests: 120230,
      avgLatencyMs: 487,
    },
    {
      allocationKey: "svc-nebula-vision",
      displayName: "vision-nebula-test",
      costCny: 6013.56,
      tokens: 173800110,
      requests: 87301,
      avgLatencyMs: 555,
    },
    {
      allocationKey: "svc-nebula-rag",
      displayName: "rag-nebula-prod",
      costCny: 4134.32,
      tokens: 119112310,
      requests: 62410,
      avgLatencyMs: 611,
    },
  ]),
} satisfies Record<TenantCostAllocationGroup, TenantCostAllocationItem[]>
