import { z } from "zod"
import { api } from "@/features/core/api"
import type {
  TenantGpuPoolQuota,
  TenantQuotasPolicy,
  UpdateTenantQuotasPolicyInput,
} from "../types/tenant-quotas-budgets"

const TenantGpuPoolQuotaSchema = z.object({
  acceleratorType: z.string().min(1, "acceleratorType is required."),
  maxCards: z.number().int().nonnegative().nullable(),
  usedCards: z.number().int().nonnegative(),
})

const TenantQuotasSimplePolicySchema = z.object({
  maxProjects: z.number().int().nonnegative().nullable(),
  maxServices: z.number().int().nonnegative().nullable(),
  dailyTokenLimit: z.number().int().nonnegative().nullable(),
  concurrentRequests: z.number().int().nonnegative().nullable(),
  gpuPoolQuotas: z.array(TenantGpuPoolQuotaSchema),
})

const UpdateTenantQuotasPolicyInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  mode: z.enum(["simple", "advanced"]),
  simple: TenantQuotasSimplePolicySchema,
  advancedJson: z.string(),
})

interface UpdateTenantQuotasPolicyPayload {
  tenantId: string
  mode: "simple" | "advanced"
  simple: {
    maxProjects: number | null
    maxServices: number | null
    dailyTokenLimit: number | null
    concurrentRequests: number | null
    gpuPoolQuotas: TenantGpuPoolQuota[]
  }
  advancedJson: string
}

function toPayload(input: UpdateTenantQuotasPolicyInput): UpdateTenantQuotasPolicyPayload {
  return UpdateTenantQuotasPolicyInputSchema.parse(input)
}

export async function updateTenantQuotasPolicy(
  input: UpdateTenantQuotasPolicyInput,
): Promise<TenantQuotasPolicy> {
  const payload = toPayload(input)
  const json = await api
    .withTenantId()
    .put(
      `infera-api/tenants/${encodeURIComponent(payload.tenantId)}/quotas-budgets/quotas-policy`,
      {
        json: {
          mode: payload.mode,
          simple: payload.simple,
          advancedJson: payload.advancedJson,
        },
      },
    )
    .json()

  return json as TenantQuotasPolicy
}
