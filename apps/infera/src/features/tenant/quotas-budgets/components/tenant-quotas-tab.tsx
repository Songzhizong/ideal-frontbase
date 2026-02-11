import { useEffect, useMemo, useState } from "react"
import { ReviewChangesDialog } from "@/features/shared/components"
import { Alert, AlertDescription, AlertTitle } from "@/packages/ui/alert"
import { Button } from "@/packages/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/packages/ui/card"
import { Label } from "@/packages/ui/label"
import { Textarea } from "@/packages/ui/textarea"
import { cn } from "@/packages/ui-utils"
import type {
  TenantPolicyCapabilities,
  TenantQuotasPolicy,
  TenantQuotasSimplePolicy,
  UpdateTenantQuotasPolicyInput,
} from "../types/tenant-quotas-budgets"
import { formatDateTime } from "../utils/tenant-quotas-budgets-formatters"
import { buildQuotasReviewPayload, type QuotasReviewPayload } from "./quotas-tab-helpers"
import { TenantQuotasSimpleEditor } from "./tenant-quotas-simple-editor"

interface TenantQuotasTabProps {
  tenantId: string
  policy: TenantQuotasPolicy
  capabilities: TenantPolicyCapabilities
  submitting: boolean
  onSubmit: (input: UpdateTenantQuotasPolicyInput) => Promise<void>
}

export function TenantQuotasTab({
  tenantId,
  policy,
  capabilities,
  submitting,
  onSubmit,
}: TenantQuotasTabProps) {
  const [mode, setMode] = useState<TenantQuotasPolicy["mode"]>(policy.mode)
  const [simpleDraft, setSimpleDraft] = useState<TenantQuotasSimplePolicy>(policy.simple)
  const [advancedJsonDraft, setAdvancedJsonDraft] = useState(policy.advancedJson)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [reviewPayload, setReviewPayload] = useState<QuotasReviewPayload | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)

  useEffect(() => {
    setMode(policy.mode)
    setSimpleDraft(policy.simple)
    setAdvancedJsonDraft(policy.advancedJson)
    setValidationMessage(null)
  }, [policy])

  const canEdit = capabilities.canEditQuotas
  const canUseAdvancedMode = canEdit && capabilities.canUseAdvancedMode

  const isDirty = useMemo(() => {
    const advancedJson = advancedJsonDraft.trim()
    return (
      mode !== policy.mode ||
      JSON.stringify(simpleDraft) !== JSON.stringify(policy.simple) ||
      advancedJson !== policy.advancedJson
    )
  }, [advancedJsonDraft, mode, policy, simpleDraft])

  const canSave = canEdit && isDirty && !submitting
  const statusLabel = mode === "advanced" ? "JSON 高级模式" : "简单模式"

  const handleOpenReview = () => {
    if (!canSave) {
      return
    }

    const normalizedAdvancedJson = advancedJsonDraft.trim()

    if (mode === "advanced") {
      if (!capabilities.canUseAdvancedMode) {
        setValidationMessage("当前角色无权限使用 JSON 高级模式。")
        return
      }

      if (normalizedAdvancedJson.length === 0) {
        setValidationMessage("JSON 高级模式下策略内容不能为空。")
        return
      }

      try {
        JSON.parse(normalizedAdvancedJson)
      } catch {
        setValidationMessage("JSON 格式无效，请修正后重试。")
        return
      }
    }

    const hasEmptyAcceleratorType = simpleDraft.gpuPoolQuotas.some(
      (item) => item.acceleratorType.trim().length === 0,
    )
    if (hasEmptyAcceleratorType) {
      setValidationMessage("GPU 资源池型号不能为空。")
      return
    }

    const nextPolicy: TenantQuotasPolicy = {
      mode,
      simple: simpleDraft,
      advancedJson: normalizedAdvancedJson,
      updatedAt: policy.updatedAt,
      updatedBy: policy.updatedBy,
    }

    const payload = buildQuotasReviewPayload(policy, nextPolicy)
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
          <AlertTitle>当前角色只读</AlertTitle>
          <AlertDescription className="text-amber-500/90">
            你可以查看配额策略，但不能直接编辑。若需调整请联系 Tenant Admin。
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-muted/30 py-0">
        <CardHeader className="flex flex-col gap-2 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">策略模式</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              当前为 {statusLabel}，最近更新于 {formatDateTime(policy.updatedAt)}（
              {policy.updatedBy}）
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-border/60 bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setMode("simple")}
              disabled={!canEdit}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                mode === "simple"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                !canEdit && "cursor-not-allowed opacity-60",
              )}
            >
              简单模式
            </button>
            <button
              type="button"
              onClick={() => setMode("advanced")}
              disabled={!canUseAdvancedMode}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                mode === "advanced"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                !canUseAdvancedMode && "cursor-not-allowed opacity-60",
              )}
            >
              JSON 高级模式
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {mode === "simple" ? (
            <TenantQuotasSimpleEditor
              draft={simpleDraft}
              setDraft={setSimpleDraft}
              canEdit={canEdit}
            />
          ) : (
            <div className="space-y-2">
              <Label htmlFor="quota-advanced-json">策略 JSON</Label>
              <Textarea
                id="quota-advanced-json"
                rows={16}
                value={advancedJsonDraft}
                disabled={!canUseAdvancedMode}
                className="cursor-text font-mono text-xs"
                placeholder='{"maxProjects": 32, "gpuPoolQuotas": [{"acceleratorType": "NVIDIA H100", "maxCards": 8}]}'
                onChange={(event) => {
                  setAdvancedJsonDraft(event.target.value)
                }}
              />
              <p className="text-xs text-muted-foreground">
                仅 Tenant Admin 可编辑。建议先在简单模式确认字段再切换到高级模式微调。
              </p>
            </div>
          )}

          {validationMessage ? (
            <p className="text-xs text-destructive">{validationMessage}</p>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleOpenReview}
              disabled={!canSave}
              className="cursor-pointer"
            >
              保存配额策略
            </Button>
          </div>
        </CardContent>
      </Card>

      {reviewPayload ? (
        <ReviewChangesDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          title="确认配额策略变更"
          description="请确认配额策略变更，提交后会立即影响资源分配和配额校验。"
          changes={reviewPayload.changes}
          before={reviewPayload.before}
          after={reviewPayload.after}
          confirmLabel="确认并保存"
          onConfirm={async () => {
            await onSubmit({
              tenantId,
              mode,
              simple: simpleDraft,
              advancedJson: advancedJsonDraft.trim(),
            })
          }}
        />
      ) : null}
    </div>
  )
}
