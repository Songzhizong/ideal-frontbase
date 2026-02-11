import { useMemo, useState } from "react"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Switch } from "@/packages/ui/switch"
import type { ModelTagItem, ModelVersionItem } from "../../types/project-models"

interface PromoteTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag: ModelTagItem | null
  versions: ModelVersionItem[]
  submitting: boolean
  onPromote: (input: { targetVersionId: string; force: boolean; reason: string }) => Promise<void>
}

export function PromoteTagDialog({
  open,
  onOpenChange,
  tag,
  versions,
  submitting,
  onPromote,
}: PromoteTagDialogProps) {
  const [targetVersionId, setTargetVersionId] = useState("")
  const [force, setForce] = useState(false)
  const [reason, setReason] = useState("")

  const targetVersion = useMemo(
    () => versions.find((item) => item.modelVersionId === targetVersionId) ?? null,
    [targetVersionId, versions],
  )
  const requiresGate = tag?.tagName === "prod"
  const gatePassed = targetVersion?.metadata.gatePassed ?? true

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          setTargetVersionId("")
          setForce(false)
          setReason("")
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Promote Tag</DialogTitle>
          <DialogDescription>
            将 Tag <span className="font-medium">{tag?.tagName ?? "-"}</span>{" "}
            从当前版本切换到目标版本。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>目标版本</Label>
            <Select value={targetVersionId} onValueChange={setTargetVersionId}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="选择目标 model_version_id" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((item) => (
                  <SelectItem
                    key={item.modelVersionId}
                    value={item.modelVersionId}
                    className="cursor-pointer"
                  >
                    {item.modelVersionId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-3 text-sm">
            <p>当前版本：{tag?.versionId ?? "-"}</p>
            <p>目标版本：{targetVersion?.modelVersionId ?? "-"}</p>
          </div>

          {requiresGate ? (
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <p className="text-sm font-medium">Gate 校验</p>
              <div className="mt-2">
                {gatePassed ? (
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-600">通过</Badge>
                ) : (
                  <Badge className="border-red-200 bg-red-50 text-red-600">未通过</Badge>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Prod Tag 需评估 Gate 通过后才能 Promote。
              </p>
            </div>
          ) : null}

          {requiresGate && !gatePassed ? (
            <div className="space-y-2 rounded-lg border border-border/50 bg-card p-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="force-promote" className="text-sm">
                  强制 Promote
                </Label>
                <Switch
                  id="force-promote"
                  checked={force}
                  onCheckedChange={setForce}
                  className="cursor-pointer"
                />
              </div>
              <Input
                placeholder="强制原因（必填）"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={!force}
              />
            </div>
          ) : null}
        </div>

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
            disabled={
              submitting ||
              targetVersionId.length === 0 ||
              (requiresGate && !gatePassed && (!force || reason.trim().length === 0))
            }
            onClick={async () => {
              await onPromote({ targetVersionId, force, reason })
              onOpenChange(false)
            }}
            className="cursor-pointer"
          >
            确认 Promote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
