import { BellRing, ShieldAlert, Webhook } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { ReviewChangesDialog } from "@/features/shared/components"
import { Alert, AlertDescription, AlertTitle } from "@/packages/ui/alert"
import { Button } from "@/packages/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/packages/ui/card"
import { Checkbox } from "@/packages/ui/checkbox"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Switch } from "@/packages/ui/switch"
import { cn } from "@/packages/ui-utils"
import type {
  TenantBudgetsPolicy,
  TenantPolicyCapabilities,
  UpdateTenantBudgetsPolicyInput,
} from "../types/tenant-quotas-budgets"
import { formatDateTime, formatPercent } from "../utils/tenant-quotas-budgets-formatters"
import {
  type BudgetsReviewPayload,
  buildBudgetsReviewPayload,
  isValidWebhookUrl,
  THRESHOLD_OPTIONS,
  toNumberInputValue,
} from "./budgets-tab-helpers"

interface TenantBudgetsTabProps {
  tenantId: string
  policy: TenantBudgetsPolicy
  capabilities: TenantPolicyCapabilities
  submitting: boolean
  onSubmit: (input: UpdateTenantBudgetsPolicyInput) => Promise<void>
}

export function TenantBudgetsTab({
  tenantId,
  policy,
  capabilities,
  submitting,
  onSubmit,
}: TenantBudgetsTabProps) {
  const [dailyBudgetInput, setDailyBudgetInput] = useState(
    toNumberInputValue(policy.dailyBudgetCny),
  )
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState(
    toNumberInputValue(policy.monthlyBudgetCny),
  )
  const [thresholds, setThresholds] = useState<number[]>(policy.alertThresholds)
  const [overageAction, setOverageAction] = useState(policy.overageAction)
  const [notifyByEmail, setNotifyByEmail] = useState(policy.notifyByEmail)
  const [webhookEnabled, setWebhookEnabled] = useState(Boolean(policy.webhookUrl))
  const [webhookUrlInput, setWebhookUrlInput] = useState(policy.webhookUrl ?? "")
  const [webhookSecretInput, setWebhookSecretInput] = useState("")
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [reviewPayload, setReviewPayload] = useState<BudgetsReviewPayload | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)

  useEffect(() => {
    setDailyBudgetInput(toNumberInputValue(policy.dailyBudgetCny))
    setMonthlyBudgetInput(toNumberInputValue(policy.monthlyBudgetCny))
    setThresholds(policy.alertThresholds)
    setOverageAction(policy.overageAction)
    setNotifyByEmail(policy.notifyByEmail)
    setWebhookEnabled(Boolean(policy.webhookUrl))
    setWebhookUrlInput(policy.webhookUrl ?? "")
    setWebhookSecretInput("")
    setValidationMessage(null)
  }, [policy])

  const canEdit = capabilities.canEditBudgets

  const normalizedDailyBudget =
    dailyBudgetInput.trim().length === 0 ? null : Number(dailyBudgetInput)
  const normalizedMonthlyBudget =
    monthlyBudgetInput.trim().length === 0 ? null : Number(monthlyBudgetInput)
  const normalizedWebhookUrl = webhookEnabled ? webhookUrlInput.trim() : ""

  const monthlyBudgetError =
    normalizedDailyBudget !== null &&
    normalizedMonthlyBudget !== null &&
    Number.isFinite(normalizedDailyBudget) &&
    Number.isFinite(normalizedMonthlyBudget) &&
    normalizedMonthlyBudget < normalizedDailyBudget
      ? "月预算不能小于日预算。"
      : null

  const webhookError =
    webhookEnabled && !isValidWebhookUrl(normalizedWebhookUrl)
      ? "Webhook 地址无效，请输入 http(s) URL。"
      : null

  const thresholdError = thresholds.length === 0 ? "至少选择一个告警阈值。" : null

  const isDirty = useMemo(() => {
    return (
      dailyBudgetInput !== toNumberInputValue(policy.dailyBudgetCny) ||
      monthlyBudgetInput !== toNumberInputValue(policy.monthlyBudgetCny) ||
      JSON.stringify(thresholds) !== JSON.stringify(policy.alertThresholds) ||
      overageAction !== policy.overageAction ||
      notifyByEmail !== policy.notifyByEmail ||
      (webhookEnabled ? normalizedWebhookUrl : null) !== policy.webhookUrl ||
      webhookSecretInput.trim().length > 0
    )
  }, [
    dailyBudgetInput,
    monthlyBudgetInput,
    normalizedWebhookUrl,
    notifyByEmail,
    overageAction,
    policy,
    thresholds,
    webhookEnabled,
    webhookSecretInput,
  ])

  const canSave =
    canEdit && isDirty && !monthlyBudgetError && !thresholdError && !webhookError && !submitting

  const handleToggleThreshold = (value: number, checked: boolean) => {
    setThresholds((current) => {
      if (checked) {
        return [...new Set([...current, value])].sort((a, b) => a - b)
      }

      return current.filter((item) => item !== value)
    })
  }

  const handleOpenReview = () => {
    if (!canSave) {
      return
    }

    const parsedDailyBudget = dailyBudgetInput.trim().length === 0 ? null : Number(dailyBudgetInput)
    const parsedMonthlyBudget =
      monthlyBudgetInput.trim().length === 0 ? null : Number(monthlyBudgetInput)

    if (
      (parsedDailyBudget !== null && !Number.isFinite(parsedDailyBudget)) ||
      (parsedMonthlyBudget !== null && !Number.isFinite(parsedMonthlyBudget))
    ) {
      setValidationMessage("预算金额必须是合法数字。")
      return
    }

    const nextPolicy: TenantBudgetsPolicy = {
      dailyBudgetCny: parsedDailyBudget,
      monthlyBudgetCny: parsedMonthlyBudget,
      alertThresholds: thresholds,
      overageAction,
      notifyByEmail,
      webhookUrl: webhookEnabled ? normalizedWebhookUrl : null,
      webhookSecretMasked: policy.webhookSecretMasked,
      updatedAt: policy.updatedAt,
      updatedBy: policy.updatedBy,
    }

    const payload = buildBudgetsReviewPayload(policy, nextPolicy)
    if (payload.changes.length === 0) {
      setValidationMessage("未检测到可提交的变更。")
      return
    }

    setValidationMessage(null)
    setReviewPayload(payload)
    setReviewOpen(true)
  }

  return (
    <div className="space-y-4">
      {!canEdit ? (
        <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-500 [&>svg]:text-amber-500">
          <AlertTitle>只读模式</AlertTitle>
          <AlertDescription className="text-amber-500/90">
            当前账号仅可查看预算策略，无法直接修改。请联系具备 Finance 编辑权限的管理员。
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-border/50 bg-gradient-to-br from-card via-card to-muted/30 py-0">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-sm font-semibold">预算策略</CardTitle>
          <p className="text-xs text-muted-foreground">
            最近更新于 {formatDateTime(policy.updatedAt)}（{policy.updatedBy}）
          </p>
        </CardHeader>

        <CardContent className="space-y-5 pt-5">
          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="daily-budget">日预算（CNY）</Label>
              <Input
                id="daily-budget"
                type="number"
                min={0}
                value={dailyBudgetInput}
                disabled={!canEdit}
                className="cursor-text"
                placeholder="不限制"
                onChange={(event) => setDailyBudgetInput(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-budget">月预算（CNY）</Label>
              <Input
                id="monthly-budget"
                type="number"
                min={0}
                value={monthlyBudgetInput}
                disabled={!canEdit}
                className="cursor-text"
                placeholder="不限制"
                onChange={(event) => setMonthlyBudgetInput(event.target.value)}
              />
              {monthlyBudgetError ? (
                <p className="text-xs text-destructive">{monthlyBudgetError}</p>
              ) : null}
            </div>
          </section>

          <section className="space-y-3 rounded-lg border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <BellRing className="size-4" aria-hidden />
              告警阈值
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {THRESHOLD_OPTIONS.map((value) => {
                const checked = thresholds.includes(value)
                return (
                  <div
                    key={value}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border border-border/50 px-3 py-2 text-sm transition-colors",
                      checked && "border-primary/30 bg-primary/5",
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={!canEdit}
                      onCheckedChange={(nextValue) => {
                        handleToggleThreshold(value, nextValue === true)
                      }}
                    />
                    <span>{formatPercent(value)}</span>
                  </div>
                )
              })}
            </div>
            {thresholdError ? <p className="text-xs text-destructive">{thresholdError}</p> : null}
          </section>

          <section className="space-y-3 rounded-lg border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldAlert className="size-4" aria-hidden />
              超限动作
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => setOverageAction("alert_only")}
                className={cn(
                  "cursor-pointer rounded-md border px-3 py-3 text-left text-sm transition-colors",
                  overageAction === "alert_only"
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 hover:bg-muted/40",
                  !canEdit && "cursor-not-allowed opacity-60",
                )}
              >
                <p className="font-medium text-foreground">Alert only</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  仅发送告警，不阻断任何推理流量。
                </p>
              </button>
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => setOverageAction("block_inference")}
                className={cn(
                  "cursor-pointer rounded-md border px-3 py-3 text-left text-sm transition-colors",
                  overageAction === "block_inference"
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border/50 hover:bg-muted/40",
                  !canEdit && "cursor-not-allowed opacity-60",
                )}
              >
                <p className="font-medium text-foreground">Block inference</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  达到阈值后阻断新增推理请求，保留告警通知。
                </p>
              </button>
            </div>
          </section>

          <section className="space-y-3 rounded-lg border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Webhook className="size-4" aria-hidden />
              通知渠道
            </div>

            <div className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
              <span className="text-sm text-foreground">邮件通知（租户管理员）</span>
              <Switch
                checked={notifyByEmail}
                disabled={!canEdit}
                onCheckedChange={(checked) => setNotifyByEmail(checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
              <span className="text-sm text-foreground">Webhook 通知</span>
              <Switch
                checked={webhookEnabled}
                disabled={!canEdit}
                onCheckedChange={(checked) => {
                  setWebhookEnabled(checked)
                  if (!checked) {
                    setWebhookUrlInput("")
                    setWebhookSecretInput("")
                  }
                }}
              />
            </div>

            {webhookEnabled ? (
              <div className="grid gap-3 rounded-md border border-border/50 bg-muted/20 p-3">
                <div className="space-y-2">
                  <Label htmlFor="budget-webhook-url">Webhook URL</Label>
                  <Input
                    id="budget-webhook-url"
                    type="url"
                    value={webhookUrlInput}
                    disabled={!canEdit}
                    className="cursor-text"
                    placeholder="https://hooks.example.com/infera/alert"
                    onChange={(event) => setWebhookUrlInput(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-webhook-secret">Webhook Secret（可选，留空不变更）</Label>
                  <Input
                    id="budget-webhook-secret"
                    type="password"
                    value={webhookSecretInput}
                    disabled={!canEdit}
                    className="cursor-text"
                    placeholder={policy.webhookSecretMasked ?? "输入新 Secret"}
                    onChange={(event) => setWebhookSecretInput(event.target.value)}
                  />
                </div>
                {webhookError ? <p className="text-xs text-destructive">{webhookError}</p> : null}
              </div>
            ) : null}
          </section>

          {validationMessage ? (
            <p className="text-xs text-destructive">{validationMessage}</p>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={!canSave}
              className="cursor-pointer"
              onClick={handleOpenReview}
            >
              保存预算策略
            </Button>
          </div>
        </CardContent>
      </Card>

      {reviewPayload ? (
        <ReviewChangesDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          title="确认预算策略变更"
          description="请确认预算、阈值、通知和超限动作。变更会立即影响预算告警行为。"
          changes={reviewPayload.changes}
          before={reviewPayload.before}
          after={reviewPayload.after}
          confirmLabel="确认并保存"
          onConfirm={async () => {
            await onSubmit({
              tenantId,
              dailyBudgetCny:
                dailyBudgetInput.trim().length === 0 ? null : Number(dailyBudgetInput),
              monthlyBudgetCny:
                monthlyBudgetInput.trim().length === 0 ? null : Number(monthlyBudgetInput),
              alertThresholds: thresholds,
              overageAction,
              notifyByEmail,
              webhookUrl: webhookEnabled ? webhookUrlInput.trim() : null,
              webhookSecret: webhookEnabled ? webhookSecretInput.trim() || null : null,
            })
          }}
        />
      ) : null}
    </div>
  )
}
