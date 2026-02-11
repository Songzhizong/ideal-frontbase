import { useEffect, useMemo, useState } from "react"
import { ReviewChangesDialog } from "@/features/shared/components"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Switch } from "@/packages/ui/switch"
import type { ProjectQuotaBudgetPolicy } from "../types/project-settings"

interface ProjectQuotasBudgetsTabProps {
  policy: ProjectQuotaBudgetPolicy
  saving: boolean
  onSave: (policy: ProjectQuotaBudgetPolicy) => Promise<void>
}

function toThresholdText(values: number[]) {
  return values.join(",")
}

function parseThresholds(value: string) {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item >= 1 && item <= 100)
}

export function ProjectQuotasBudgetsTab({ policy, saving, onSave }: ProjectQuotasBudgetsTabProps) {
  const [form, setForm] = useState<ProjectQuotaBudgetPolicy>(policy)
  const [thresholdText, setThresholdText] = useState(toThresholdText(policy.alertThresholds))
  const [reviewOpen, setReviewOpen] = useState(false)

  useEffect(() => {
    setForm(policy)
    setThresholdText(toThresholdText(policy.alertThresholds))
  }, [policy])

  const reviewChanges = useMemo(() => {
    const changes: Array<{ field: string; before: string; after: string }> = []
    if (form.inheritTenantPolicy !== policy.inheritTenantPolicy) {
      changes.push({
        field: "策略模式",
        before: policy.inheritTenantPolicy ? "继承租户策略" : "覆盖租户策略",
        after: form.inheritTenantPolicy ? "继承租户策略" : "覆盖租户策略",
      })
    }
    if (form.dailyTokenLimit !== policy.dailyTokenLimit) {
      changes.push({
        field: "日 Token 限额",
        before: String(policy.dailyTokenLimit),
        after: String(form.dailyTokenLimit),
      })
    }
    if (form.monthlyTokenLimit !== policy.monthlyTokenLimit) {
      changes.push({
        field: "月 Token 限额",
        before: String(policy.monthlyTokenLimit),
        after: String(form.monthlyTokenLimit),
      })
    }
    if (form.monthlyBudgetCny !== policy.monthlyBudgetCny) {
      changes.push({
        field: "月预算（CNY）",
        before: String(policy.monthlyBudgetCny),
        after: String(form.monthlyBudgetCny),
      })
    }
    if (form.overLimitAction !== policy.overLimitAction) {
      changes.push({
        field: "超限动作",
        before: policy.overLimitAction,
        after: form.overLimitAction,
      })
    }
    if (thresholdText !== toThresholdText(policy.alertThresholds)) {
      changes.push({
        field: "告警阈值",
        before: toThresholdText(policy.alertThresholds),
        after: thresholdText,
      })
    }
    return changes
  }, [form, policy, thresholdText])

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          租户默认策略当前为：
          <Badge variant="outline" className="ml-2">
            {policy.inheritTenantPolicy ? "继承" : "覆盖"}
          </Badge>
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-border/50 bg-card p-4">
        <div className="flex items-center justify-between rounded-md border border-border/50 bg-muted/20 px-3 py-2">
          <div>
            <p className="text-sm font-medium">是否继承租户策略</p>
            <p className="text-xs text-muted-foreground">关闭后可自定义项目配额和预算限制。</p>
          </div>
          <Switch
            checked={form.inheritTenantPolicy}
            onCheckedChange={(checked) => {
              setForm((prev) => ({
                ...prev,
                inheritTenantPolicy: checked,
              }))
            }}
            className="cursor-pointer"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="daily-token-limit">日 Token 限额</Label>
            <Input
              id="daily-token-limit"
              type="number"
              value={form.dailyTokenLimit}
              onChange={(event) => {
                setForm((prev) => ({
                  ...prev,
                  dailyTokenLimit: Number(event.target.value || 0),
                }))
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly-token-limit">月 Token 限额</Label>
            <Input
              id="monthly-token-limit"
              type="number"
              value={form.monthlyTokenLimit}
              onChange={(event) => {
                setForm((prev) => ({
                  ...prev,
                  monthlyTokenLimit: Number(event.target.value || 0),
                }))
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly-budget">月预算 (CNY)</Label>
            <Input
              id="monthly-budget"
              type="number"
              value={form.monthlyBudgetCny}
              onChange={(event) => {
                setForm((prev) => ({
                  ...prev,
                  monthlyBudgetCny: Number(event.target.value || 0),
                }))
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="over-limit-action">超限动作</Label>
            <Select
              value={form.overLimitAction}
              onValueChange={(value: ProjectQuotaBudgetPolicy["overLimitAction"]) => {
                setForm((prev) => ({
                  ...prev,
                  overLimitAction: value,
                }))
              }}
            >
              <SelectTrigger id="over-limit-action" className="w-full cursor-pointer">
                <SelectValue placeholder="选择动作" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Throttle" className="cursor-pointer">
                  Throttle
                </SelectItem>
                <SelectItem value="Block" className="cursor-pointer">
                  Block
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alert-thresholds">告警阈值（逗号分隔）</Label>
          <Input
            id="alert-thresholds"
            value={thresholdText}
            onChange={(event) => setThresholdText(event.target.value)}
            placeholder="70,85,95"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification-channels">通知渠道（逗号分隔）</Label>
          <Input
            id="notification-channels"
            value={form.notificationChannels.join(",")}
            onChange={(event) => {
              setForm((prev) => ({
                ...prev,
                notificationChannels: event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item.length > 0),
              }))
            }}
            placeholder="邮件,Webhook"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            disabled={saving}
            onClick={() => setReviewOpen(true)}
            className="cursor-pointer"
          >
            保存策略
          </Button>
        </div>
      </div>

      <ReviewChangesDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        title="确认保存项目配额策略"
        description="提交后将覆盖当前项目配额与预算策略。"
        changes={reviewChanges}
        before={policy}
        after={{
          ...form,
          alertThresholds: parseThresholds(thresholdText),
        }}
        onConfirm={async () => {
          await onSave({
            ...form,
            alertThresholds: parseThresholds(thresholdText),
          })
        }}
      />
    </div>
  )
}
