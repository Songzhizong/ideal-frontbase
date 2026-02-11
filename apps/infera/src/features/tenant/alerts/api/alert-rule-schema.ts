import { z } from "zod"
import {
  TENANT_ALERT_CHANNELS,
  TENANT_ALERT_OVERAGE_ACTIONS,
  TENANT_ALERT_SCOPE_MODES,
  TENANT_ALERT_TYPES,
} from "../types/tenant-alerts"

export const TenantAlertConditionSchema = z.object({
  metric: z.string().min(1),
  operator: z.enum([">", ">="]),
  threshold: z.number(),
  unit: z.string().min(1),
  durationMinutes: z.number().int().min(1),
})

export const UpsertTenantAlertRulePayloadSchema = z.object({
  name: z.string().min(1).max(64),
  type: z.enum(TENANT_ALERT_TYPES),
  scopeMode: z.enum(TENANT_ALERT_SCOPE_MODES),
  projectIds: z.array(z.string()),
  serviceIds: z.array(z.string()),
  condition: TenantAlertConditionSchema,
  channels: z.array(z.enum(TENANT_ALERT_CHANNELS)).min(1),
  webhookUrl: z.string().url().nullable(),
  overageAction: z.enum(TENANT_ALERT_OVERAGE_ACTIONS).nullable(),
  enabled: z.boolean(),
})
