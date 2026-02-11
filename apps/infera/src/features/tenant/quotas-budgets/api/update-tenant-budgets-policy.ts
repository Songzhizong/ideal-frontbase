import { z } from "zod"
import { api } from "@/features/core/api"
import type {
  TenantBudgetsPolicy,
  UpdateTenantBudgetsPolicyInput,
} from "../types/tenant-quotas-budgets"

const UpdateTenantBudgetsPolicyInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  dailyBudgetCny: z.number().nonnegative().nullable(),
  monthlyBudgetCny: z.number().nonnegative().nullable(),
  alertThresholds: z.array(z.number()).min(1),
  overageAction: z.enum(["alert_only", "block_inference"]),
  notifyByEmail: z.boolean(),
  webhookUrl: z.string().url().nullable(),
  webhookSecret: z.string().nullable(),
})

interface UpdateTenantBudgetsPolicyPayload {
  tenantId: string
  dailyBudgetCny: number | null
  monthlyBudgetCny: number | null
  alertThresholds: number[]
  overageAction: "alert_only" | "block_inference"
  notifyByEmail: boolean
  webhookUrl: string | null
  webhookSecret: string | null
}

function toPayload(input: UpdateTenantBudgetsPolicyInput): UpdateTenantBudgetsPolicyPayload {
  return UpdateTenantBudgetsPolicyInputSchema.parse(input)
}

export async function updateTenantBudgetsPolicy(
  input: UpdateTenantBudgetsPolicyInput,
): Promise<TenantBudgetsPolicy> {
  const payload = toPayload(input)
  const json = await api
    .withTenantId()
    .put(
      `infera-api/tenants/${encodeURIComponent(payload.tenantId)}/quotas-budgets/budgets-policy`,
      {
        json: {
          dailyBudgetCny: payload.dailyBudgetCny,
          monthlyBudgetCny: payload.monthlyBudgetCny,
          alertThresholds: payload.alertThresholds,
          overageAction: payload.overageAction,
          notifyByEmail: payload.notifyByEmail,
          webhookUrl: payload.webhookUrl,
          webhookSecret: payload.webhookSecret,
        },
      },
    )
    .json()

  return json as TenantBudgetsPolicy
}
