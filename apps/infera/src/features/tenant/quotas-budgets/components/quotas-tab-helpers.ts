import type { ReviewChangeItem } from "@/features/shared/components"
import type { TenantQuotasPolicy, TenantQuotasSimplePolicy } from "../types/tenant-quotas-budgets"
import {
  formatNullableNumber,
  parseNullableNumberInput,
} from "../utils/tenant-quotas-budgets-formatters"

export interface QuotasReviewPayload {
  changes: ReviewChangeItem[]
  before: TenantQuotasPolicy
  after: TenantQuotasPolicy
}

export function toNumberInputValue(value: number | null) {
  return value === null ? "" : String(value)
}

function stringifyValue(value: number | null) {
  if (value === null) {
    return "未限制"
  }

  return formatNullableNumber(value)
}

export function buildQuotasReviewPayload(
  before: TenantQuotasPolicy,
  after: TenantQuotasPolicy,
): QuotasReviewPayload {
  const changes: ReviewChangeItem[] = []

  if (before.mode !== after.mode) {
    changes.push({
      field: "策略模式",
      before: before.mode === "advanced" ? "JSON 高级模式" : "简单模式",
      after: after.mode === "advanced" ? "JSON 高级模式" : "简单模式",
    })
  }

  if (before.simple.maxProjects !== after.simple.maxProjects) {
    changes.push({
      field: "最大项目数",
      before: stringifyValue(before.simple.maxProjects),
      after: stringifyValue(after.simple.maxProjects),
    })
  }

  if (before.simple.maxServices !== after.simple.maxServices) {
    changes.push({
      field: "最大服务数",
      before: stringifyValue(before.simple.maxServices),
      after: stringifyValue(after.simple.maxServices),
    })
  }

  if (before.simple.dailyTokenLimit !== after.simple.dailyTokenLimit) {
    changes.push({
      field: "每日 Token 上限",
      before: stringifyValue(before.simple.dailyTokenLimit),
      after: stringifyValue(after.simple.dailyTokenLimit),
    })
  }

  if (before.simple.concurrentRequests !== after.simple.concurrentRequests) {
    changes.push({
      field: "并发请求上限",
      before: stringifyValue(before.simple.concurrentRequests),
      after: stringifyValue(after.simple.concurrentRequests),
    })
  }

  const beforeGpu = JSON.stringify(before.simple.gpuPoolQuotas)
  const afterGpu = JSON.stringify(after.simple.gpuPoolQuotas)
  if (beforeGpu !== afterGpu) {
    changes.push({
      field: "GPU 资源池配额",
      before: `${before.simple.gpuPoolQuotas.length} 项`,
      after: `${after.simple.gpuPoolQuotas.length} 项`,
    })
  }

  if (before.advancedJson !== after.advancedJson) {
    changes.push({
      field: "高级策略 JSON",
      before: "已更新",
      after: "已更新",
    })
  }

  return {
    changes,
    before,
    after,
  }
}

export function updateSimpleNumberField(
  draft: TenantQuotasSimplePolicy,
  field: keyof Omit<TenantQuotasSimplePolicy, "gpuPoolQuotas">,
  rawValue: string,
): TenantQuotasSimplePolicy {
  return {
    ...draft,
    [field]: parseNullableNumberInput(rawValue),
  }
}
