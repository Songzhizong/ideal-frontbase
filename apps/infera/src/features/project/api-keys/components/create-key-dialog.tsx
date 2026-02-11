import { LoaderCircle, Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { CopySecretOnceDialog } from "@/features/shared/components"
import { Button } from "@/packages/ui/button"
import { Checkbox } from "@/packages/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Textarea } from "@/packages/ui/textarea"
import { useApiKeyScopeOptionsQuery } from "../hooks"
import type { CreateApiKeyInput, CreateApiKeyResult } from "../types"
import { downloadTextFile, toErrorMessage } from "./api-key-formatters"

interface CreateKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  projectId: string
  submitting: boolean
  onSubmit: (input: CreateApiKeyInput) => Promise<CreateApiKeyResult>
}

const DEFAULT_SCOPES: CreateApiKeyInput["scopes"] = ["inference:invoke"]

function normalizePositiveInteger(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  const parsed = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }
  return parsed
}

function toExpirationIso(dateValue: string) {
  const trimmed = dateValue.trim()
  if (!trimmed) {
    return null
  }
  const date = new Date(`${trimmed}T23:59:59`)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toISOString()
}

export function CreateKeyDialog({
  open,
  onOpenChange,
  tenantId,
  projectId,
  submitting,
  onSubmit,
}: CreateKeyDialogProps) {
  const scopeQuery = useApiKeyScopeOptionsQuery(tenantId, projectId)
  const [name, setName] = useState("")
  const [selectedScopes, setSelectedScopes] = useState<CreateApiKeyInput["scopes"]>(DEFAULT_SCOPES)
  const [expiresOn, setExpiresOn] = useState("")
  const [rpmUnlimited, setRpmUnlimited] = useState(false)
  const [rpmLimit, setRpmLimit] = useState("1200")
  const [dailyTokenUnlimited, setDailyTokenUnlimited] = useState(false)
  const [dailyTokenLimit, setDailyTokenLimit] = useState("3000000")
  const [note, setNote] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const [secretDialogOpen, setSecretDialogOpen] = useState(false)
  const [secretValue, setSecretValue] = useState("")
  const [secretName, setSecretName] = useState("")

  useEffect(() => {
    if (!open) {
      setName("")
      setSelectedScopes(DEFAULT_SCOPES)
      setExpiresOn("")
      setRpmUnlimited(false)
      setRpmLimit("1200")
      setDailyTokenUnlimited(false)
      setDailyTokenLimit("3000000")
      setNote("")
      setFormError(null)
    }
  }, [open])

  const scopeOptions = useMemo(() => {
    if (!scopeQuery.data || scopeQuery.data.length === 0) {
      return DEFAULT_SCOPES
    }
    return scopeQuery.data
  }, [scopeQuery.data])

  const canSubmit =
    name.trim().length > 0 &&
    selectedScopes.length > 0 &&
    !submitting &&
    !scopeQuery.isFetching &&
    !scopeQuery.isPending

  const handleScopeToggle = (scope: CreateApiKeyInput["scopes"][number], checked: boolean) => {
    setSelectedScopes((previous) => {
      if (checked) {
        if (previous.includes(scope)) {
          return previous
        }
        return [...previous, scope]
      }
      return previous.filter((item) => item !== scope)
    })
  }

  const handleCreate = async () => {
    setFormError(null)

    if (name.trim().length < 1 || name.trim().length > 64) {
      setFormError("名称长度需在 1-64 个字符之间")
      return
    }

    if (selectedScopes.length === 0) {
      setFormError("请至少选择一个 Scope")
      return
    }

    const nextRpmLimit = rpmUnlimited ? null : normalizePositiveInteger(rpmLimit)
    if (!rpmUnlimited && nextRpmLimit === null) {
      setFormError("RPM limit 需为正整数")
      return
    }

    const nextDailyTokenLimit = dailyTokenUnlimited
      ? null
      : normalizePositiveInteger(dailyTokenLimit)
    if (!dailyTokenUnlimited && nextDailyTokenLimit === null) {
      setFormError("Daily token limit 需为正整数")
      return
    }

    const expiresAt = toExpirationIso(expiresOn)
    if (expiresOn.trim().length > 0 && expiresAt === null) {
      setFormError("过期时间格式不正确")
      return
    }

    try {
      const result = await onSubmit({
        tenantId,
        projectId,
        name: name.trim(),
        scopes: selectedScopes,
        expiresAt,
        rpmLimit: nextRpmLimit,
        dailyTokenLimit: nextDailyTokenLimit,
        note: note.trim(),
      })

      onOpenChange(false)
      setSecretValue(result.secret)
      setSecretName(result.apiKey.name)
      setSecretDialogOpen(true)
    } catch (error) {
      toast.error(toErrorMessage(error))
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-4 text-primary" aria-hidden />
              创建 API Key
            </DialogTitle>
            <DialogDescription>
              配置调用范围、速率限制与过期策略，创建后将仅展示一次明文密钥。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="create-key-name">名称</Label>
              <Input
                id="create-key-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={64}
                placeholder="例如：chat-gateway-prod"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Scopes</Label>
              <div className="grid gap-2 rounded-lg border border-border/50 bg-muted/20 p-3 sm:grid-cols-2">
                {scopeOptions.map((scope) => {
                  const checked = selectedScopes.includes(scope)
                  const scopeCheckboxId = `create-key-scope-${scope.replaceAll(":", "-")}`
                  return (
                    <div
                      key={scope}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-2 py-1.5 transition-colors hover:border-border/60 hover:bg-muted/40"
                    >
                      <Checkbox
                        id={scopeCheckboxId}
                        checked={checked}
                        onCheckedChange={(value) => handleScopeToggle(scope, value === true)}
                      />
                      <Label htmlFor={scopeCheckboxId} className="cursor-pointer text-sm">
                        {scope}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-key-expire">过期时间（可选）</Label>
              <Input
                id="create-key-expire"
                type="date"
                value={expiresOn}
                onChange={(event) => setExpiresOn(event.target.value)}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="create-key-rpm">RPM limit</Label>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    id="create-key-rpm-unlimited"
                    checked={rpmUnlimited}
                    onCheckedChange={(value) => setRpmUnlimited(value === true)}
                  />
                  <Label htmlFor="create-key-rpm-unlimited" className="cursor-pointer text-xs">
                    不限制
                  </Label>
                </div>
              </div>
              <Input
                id="create-key-rpm"
                value={rpmLimit}
                onChange={(event) => setRpmLimit(event.target.value)}
                inputMode="numeric"
                disabled={rpmUnlimited}
                placeholder="1200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="create-key-daily">Daily token limit</Label>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    id="create-key-daily-unlimited"
                    checked={dailyTokenUnlimited}
                    onCheckedChange={(value) => setDailyTokenUnlimited(value === true)}
                  />
                  <Label htmlFor="create-key-daily-unlimited" className="cursor-pointer text-xs">
                    不限制
                  </Label>
                </div>
              </div>
              <Input
                id="create-key-daily"
                value={dailyTokenLimit}
                onChange={(event) => setDailyTokenLimit(event.target.value)}
                inputMode="numeric"
                disabled={dailyTokenUnlimited}
                placeholder="3000000"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="create-key-description">说明</Label>
              <Textarea
                id="create-key-description"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder="可选，用于说明该 Key 的用途与维护人。"
              />
            </div>
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={!canSubmit}
              className="cursor-pointer"
            >
              {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
              创建 Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CopySecretOnceDialog
        open={secretDialogOpen}
        onOpenChange={setSecretDialogOpen}
        secret={secretValue}
        title="保存 API Key"
        description="密钥仅展示一次，请先复制或下载再关闭弹窗。若遗失，请执行 Rotate。"
        acknowledgeLabel="我已复制并妥善保存该密钥"
        confirmLabel="我已保存"
        secondaryAction={{
          label: "下载 .txt",
          onClick: () => {
            downloadTextFile(`${secretName || "api-key"}.txt`, `${secretName}\n${secretValue}`)
          },
        }}
      />
    </>
  )
}
