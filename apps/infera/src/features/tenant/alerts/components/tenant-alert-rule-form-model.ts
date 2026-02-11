import { z } from "zod"
import {
  TENANT_ALERT_CHANNELS,
  TENANT_ALERT_OVERAGE_ACTIONS,
  TENANT_ALERT_SCOPE_MODES,
  TENANT_ALERT_TYPES,
  type TenantAlertRuleItem,
} from "../types/tenant-alerts"

export const METRIC_OPTIONS = {
  cost: [
    { value: "daily_cost_cny", label: "日花费", unit: "CNY" },
    { value: "monthly_cost_cny", label: "月花费", unit: "CNY" },
    { value: "cost_growth_rate", label: "增长率", unit: "%" },
  ],
  error_rate: [
    { value: "http_5xx_rate", label: "5xx 比例", unit: "%" },
    { value: "http_4xx_rate", label: "4xx 比例", unit: "%" },
  ],
  latency: [
    { value: "p95_latency_ms", label: "P95 延迟", unit: "ms" },
    { value: "p99_latency_ms", label: "P99 延迟", unit: "ms" },
  ],
  pending_timeout: [{ value: "pending_duration_min", label: "Pending 时长", unit: "min" }],
  cold_start: [
    { value: "cold_start_count", label: "冷启动次数", unit: "count" },
    { value: "cold_start_latency_ms", label: "冷启动延迟", unit: "ms" },
  ],
} as const

export const RuleFormSchema = z
  .object({
    name: z.string().trim().min(2, "规则名至少 2 个字符").max(64, "规则名不能超过 64 个字符"),
    type: z.enum(TENANT_ALERT_TYPES),
    scopeMode: z.enum(TENANT_ALERT_SCOPE_MODES),
    projectIds: z.array(z.string()),
    serviceIds: z.array(z.string()),
    metric: z.string().min(1, "请选择指标"),
    operator: z.enum([">", ">="]),
    threshold: z.number().positive("阈值必须大于 0"),
    durationMinutes: z.number().int().min(1, "持续时间至少为 1 分钟"),
    channels: z.array(z.enum(TENANT_ALERT_CHANNELS)).min(1, "至少选择一个通知渠道"),
    webhookUrl: z.string().trim(),
    overageAction: z.enum(TENANT_ALERT_OVERAGE_ACTIONS).nullable(),
    enabled: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.scopeMode === "projects" && value.projectIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "请选择至少一个项目",
        path: ["projectIds"],
      })
    }

    if (value.scopeMode === "services") {
      if (value.projectIds.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "请先选择项目，再选择服务",
          path: ["projectIds"],
        })
      }
      if (value.serviceIds.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "请选择至少一个服务",
          path: ["serviceIds"],
        })
      }
    }

    if (value.channels.includes("Webhook")) {
      if (!value.webhookUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Webhook 渠道需要填写 URL",
          path: ["webhookUrl"],
        })
      } else if (!z.string().url().safeParse(value.webhookUrl).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "请输入有效的 Webhook URL",
          path: ["webhookUrl"],
        })
      }
    }

    if (value.type === "cost" && value.overageAction === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "成本类型规则需要设置超限动作",
        path: ["overageAction"],
      })
    }
  })

export type RuleFormValues = z.infer<typeof RuleFormSchema>

export type MetricOption = {
  value: string
  label: string
  unit: string
}

export function getMetricOptions(type: RuleFormValues["type"]): MetricOption[] {
  return [...METRIC_OPTIONS[type]]
}

export function getDefaultRuleFormValues(rule: TenantAlertRuleItem | null): RuleFormValues {
  if (!rule) {
    return {
      name: "",
      type: "error_rate",
      scopeMode: "all_tenant",
      projectIds: [],
      serviceIds: [],
      metric: "http_5xx_rate",
      operator: ">",
      threshold: 5,
      durationMinutes: 5,
      channels: ["Email"],
      webhookUrl: "",
      overageAction: null,
      enabled: true,
    }
  }

  return {
    name: rule.name,
    type: rule.type,
    scopeMode: rule.scopeMode,
    projectIds: rule.projectIds,
    serviceIds: rule.serviceIds,
    metric: rule.condition.metric,
    operator: rule.condition.operator,
    threshold: rule.condition.threshold,
    durationMinutes: rule.condition.durationMinutes,
    channels: rule.channels,
    webhookUrl: rule.webhookUrl ?? "",
    overageAction: rule.overageAction,
    enabled: rule.enabled,
  }
}

export function toggleListValue(values: string[], target: string, checked: boolean) {
  if (checked) {
    return Array.from(new Set([...values, target]))
  }

  return values.filter((value) => value !== target)
}
