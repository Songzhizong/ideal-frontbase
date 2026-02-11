export const TENANT_BILLING_RANGES = ["7d", "30d"] as const

export type TenantBillingRange = (typeof TENANT_BILLING_RANGES)[number]

export interface TenantBillingUsageSummary {
  monthlyCostCny: number
  monthlyBudgetCny: number | null
  monthlyBudgetUsageRate: number | null
  tokensThisMonth: number
  requestsThisMonth: number
  gpuHoursThisMonth: number
  avgLatencyMs: number
  successRate: number
}

export interface TenantBillingCostTrendPoint {
  timestamp: string
  costCny: number
  tokens: number
  requests: number
  gpuHours: number
}

export interface TenantBillingCostCompositionItem {
  category: string
  amountCny: number
  ratio: number
}

export interface TenantBillingOverviewResponse {
  summary: TenantBillingUsageSummary
  costTrend: TenantBillingCostTrendPoint[]
  costComposition: TenantBillingCostCompositionItem[]
  updatedAt: string
}

export const TENANT_INVOICE_STATUSES = ["Paid", "Unpaid", "Overdue"] as const

export type TenantInvoiceStatus = (typeof TENANT_INVOICE_STATUSES)[number]

export interface TenantInvoiceItem {
  invoiceId: string
  periodStart: string
  periodEnd: string
  issuedAt: string
  dueAt: string | null
  paidAt: string | null
  currency: "CNY"
  amountCny: number
  status: TenantInvoiceStatus
  downloadUrl: string
}

export interface TenantInvoicesListResponse {
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  content: TenantInvoiceItem[]
}

export interface TenantInvoiceLineItem {
  lineId: string
  category: string
  description: string
  quantity: number
  unit: string
  unitPriceCny: number
  amountCny: number
}

export interface TenantInvoiceDetailResponse {
  invoice: TenantInvoiceItem
  subtotalCny: number
  taxCny: number
  totalCny: number
  lineItems: TenantInvoiceLineItem[]
}

export const TENANT_PAYMENT_METHOD_STATUSES = ["Active", "Expired", "PendingVerification"] as const

export type TenantPaymentMethodStatus = (typeof TENANT_PAYMENT_METHOD_STATUSES)[number]

export interface TenantPaymentMethodItem {
  methodId: string
  type: "Card" | "BankTransfer"
  holderName: string
  brand: string | null
  last4: string | null
  expiresAt: string | null
  billingEmail: string
  isDefault: boolean
  status: TenantPaymentMethodStatus
}

export interface TenantPaymentMethodsResponse {
  methods: TenantPaymentMethodItem[]
}

export const TENANT_COST_ALLOCATION_GROUPS = ["project", "api_key", "service"] as const

export type TenantCostAllocationGroup = (typeof TENANT_COST_ALLOCATION_GROUPS)[number]

export interface TenantCostAllocationItem {
  allocationKey: string
  displayName: string
  shareRate: number
  costCny: number
  tokens: number
  requests: number
  avgLatencyMs: number
}

export interface TenantCostAllocationResponse {
  groupBy: TenantCostAllocationGroup
  range: TenantBillingRange
  totalCostCny: number
  generatedAt: string
  rows: TenantCostAllocationItem[]
}
