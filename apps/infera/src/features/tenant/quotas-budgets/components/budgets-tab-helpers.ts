import type { ReviewChangeItem } from "@/features/shared/components"
import type { TenantBudgetsPolicy } from "../types/tenant-quotas-budgets"
import {
  formatCurrency,
  formatPercent,
  getOverageActionLabel,
} from "../utils/tenant-quotas-budgets-formatters"

export const THRESHOLD_OPTIONS = [0.5, 0.8, 0.9, 1] as const

export interface BudgetsReviewPayload {
  changes: ReviewChangeItem[]
  before: TenantBudgetsPolicy
  after: TenantBudgetsPolicy
}

export function toNumberInputValue(value: number | null) {
  return value === null ? "" : String(value)
}

function toThresholdLabel(values: number[]) {
  return values.map((item) => formatPercent(item)).join(" / ")
}

export function isValidWebhookUrl(value: string) {
  if (value.trim().length === 0) {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

export function buildBudgetsReviewPayload(
  before: TenantBudgetsPolicy,
  after: TenantBudgetsPolicy,
): BudgetsReviewPayload {
  const changes: ReviewChangeItem[] = []

  if (before.dailyBudgetCny !== after.dailyBudgetCny) {
    changes.push({
      field: "日预算",
      before: formatCurrency(before.dailyBudgetCny),
      after: formatCurrency(after.dailyBudgetCny),
    })
  }

  if (before.monthlyBudgetCny !== after.monthlyBudgetCny) {
    changes.push({
      field: "月预算",
      before: formatCurrency(before.monthlyBudgetCny),
      after: formatCurrency(after.monthlyBudgetCny),
    })
  }

  if (JSON.stringify(before.alertThresholds) !== JSON.stringify(after.alertThresholds)) {
    changes.push({
      field: "告警阈值",
      before: toThresholdLabel(before.alertThresholds),
      after: toThresholdLabel(after.alertThresholds),
    })
  }

  if (before.overageAction !== after.overageAction) {
    changes.push({
      field: "超限动作",
      before: getOverageActionLabel(before.overageAction),
      after: getOverageActionLabel(after.overageAction),
    })
  }

  if (before.notifyByEmail !== after.notifyByEmail) {
    changes.push({
      field: "邮件通知",
      before: before.notifyByEmail ? "开启" : "关闭",
      after: after.notifyByEmail ? "开启" : "关闭",
    })
  }

  if ((before.webhookUrl ?? "") !== (after.webhookUrl ?? "")) {
    changes.push({
      field: "Webhook 通知",
      before: before.webhookUrl ?? "关闭",
      after: after.webhookUrl ?? "关闭",
    })
  }

  return {
    changes,
    before,
    after,
  }
}
