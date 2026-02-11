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

export const TENANT_1_SUMMARY: TenantBillingOverviewResponse["summary"] = {
  monthlyCostCny: 52340.18,
  monthlyBudgetCny: 80000,
  monthlyBudgetUsageRate: 0.6543,
  tokensThisMonth: 1523760210,
  requestsThisMonth: 803962,
  gpuHoursThisMonth: 1296.3,
  avgLatencyMs: 463.4,
  successRate: 0.992,
}

export const TENANT_1_COMPOSITION: readonly TenantBillingCostCompositionItem[] = [
  { category: "模型推理 Tokens", amountCny: 29820.18, ratio: 0.5698 },
  { category: "GPU 运行时", amountCny: 17120.0, ratio: 0.3271 },
  { category: "存储与网络", amountCny: 5400.0, ratio: 0.1031 },
]

export const TENANT_1_INVOICES: TenantInvoiceItem[] = [
  buildInvoice(
    "inv-2026-01",
    "2026-01-01T00:00:00Z",
    "2026-01-31T23:59:59Z",
    51982.13,
    "Paid",
    "2026-02-05T08:20:00Z",
  ),
  buildInvoice(
    "inv-2025-12",
    "2025-12-01T00:00:00Z",
    "2025-12-31T23:59:59Z",
    47263.92,
    "Paid",
    "2026-01-03T10:00:00Z",
  ),
  buildInvoice(
    "inv-2025-11",
    "2025-11-01T00:00:00Z",
    "2025-11-30T23:59:59Z",
    45123.56,
    "Overdue",
    null,
  ),
  buildInvoice(
    "inv-2025-10",
    "2025-10-01T00:00:00Z",
    "2025-10-31T23:59:59Z",
    43232.88,
    "Paid",
    "2025-11-06T09:15:00Z",
  ),
  buildInvoice(
    "inv-2025-09",
    "2025-09-01T00:00:00Z",
    "2025-09-30T23:59:59Z",
    38912.4,
    "Unpaid",
    null,
  ),
]

export const TENANT_1_PAYMENT_METHODS: TenantPaymentMethodItem[] = [
  {
    methodId: "pm-card-01",
    type: "Card",
    holderName: "Acme AI Operations",
    brand: "Visa",
    last4: "8832",
    expiresAt: "2028-05-31T00:00:00Z",
    billingEmail: "finance@acme.ai",
    isDefault: true,
    status: "Active",
  },
  {
    methodId: "pm-card-02",
    type: "Card",
    holderName: "Acme AI Backup",
    brand: "Mastercard",
    last4: "1008",
    expiresAt: "2026-10-31T00:00:00Z",
    billingEmail: "finops@acme.ai",
    isDefault: false,
    status: "Active",
  },
]

export const TENANT_1_COST_ALLOCATION = {
  project: withShareRate([
    {
      allocationKey: "project-chat",
      displayName: "Chat Gateway",
      costCny: 17370.14,
      tokens: 502310020,
      requests: 261902,
      avgLatencyMs: 391,
    },
    {
      allocationKey: "project-rag",
      displayName: "RAG Platform",
      costCny: 12930.66,
      tokens: 381290920,
      requests: 198302,
      avgLatencyMs: 470,
    },
    {
      allocationKey: "project-eval",
      displayName: "Evaluation Hub",
      costCny: 10312.2,
      tokens: 301298120,
      requests: 143280,
      avgLatencyMs: 522,
    },
    {
      allocationKey: "project-ops",
      displayName: "Ops Assistant",
      costCny: 6490.18,
      tokens: 183120210,
      requests: 97120,
      avgLatencyMs: 489,
    },
    {
      allocationKey: "project-vision",
      displayName: "Vision Stack",
      costCny: 5237,
      tokens: 155740940,
      requests: 103358,
      avgLatencyMs: 560,
    },
  ]),
  api_key: withShareRate([
    {
      allocationKey: "key-public-web",
      displayName: "web-public-key",
      costCny: 19365.86,
      tokens: 566210200,
      requests: 310123,
      avgLatencyMs: 411,
    },
    {
      allocationKey: "key-ops-bot",
      displayName: "ops-bot",
      costCny: 12038.24,
      tokens: 349876500,
      requests: 170990,
      avgLatencyMs: 478,
    },
    {
      allocationKey: "key-partner-a",
      displayName: "partner-a-prod",
      costCny: 10468.04,
      tokens: 304560020,
      requests: 150872,
      avgLatencyMs: 496,
    },
    {
      allocationKey: "key-internal-ci",
      displayName: "ci-eval",
      costCny: 5757.42,
      tokens: 167232120,
      requests: 90341,
      avgLatencyMs: 530,
    },
    {
      allocationKey: "key-qa",
      displayName: "qa-smoke",
      costCny: 4710.62,
      tokens: 135881370,
      requests: 81636,
      avgLatencyMs: 580,
    },
  ]),
  service: withShareRate([
    {
      allocationKey: "svc-chat-prod",
      displayName: "chat-gateway-prod",
      costCny: 21459.47,
      tokens: 612301280,
      requests: 328901,
      avgLatencyMs: 382,
    },
    {
      allocationKey: "svc-rag-prod",
      displayName: "rag-router-prod",
      costCny: 13608.45,
      tokens: 402823490,
      requests: 195673,
      avgLatencyMs: 462,
    },
    {
      allocationKey: "svc-vision-test",
      displayName: "vision-gateway-test",
      costCny: 7851.03,
      tokens: 231540210,
      requests: 109218,
      avgLatencyMs: 611,
    },
    {
      allocationKey: "svc-eval-ci",
      displayName: "eval-ci-worker",
      costCny: 5757.42,
      tokens: 173340120,
      requests: 92122,
      avgLatencyMs: 542,
    },
    {
      allocationKey: "svc-ops-dev",
      displayName: "ops-helper-dev",
      costCny: 3663.81,
      tokens: 103755110,
      requests: 68121,
      avgLatencyMs: 589,
    },
  ]),
} satisfies Record<TenantCostAllocationGroup, TenantCostAllocationItem[]>
