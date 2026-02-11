import { LoaderCircle, TriangleAlert } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
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

export interface DangerConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetName: string
  title?: string
  description?: string
  requiredText?: string
  inputLabel?: string
  inputPlaceholder?: string
  cancelLabel?: string
  confirmLabel?: string
  onConfirm?: () => void | Promise<void>
}

export function DangerConfirmDialog({
  open,
  onOpenChange,
  targetName,
  title = "确认危险操作",
  description = "该操作不可撤销，请确认后继续。",
  requiredText,
  inputLabel,
  inputPlaceholder,
  cancelLabel = "取消",
  confirmLabel = "确认删除",
  onConfirm,
}: DangerConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const expectedText = useMemo(() => requiredText ?? targetName, [requiredText, targetName])

  useEffect(() => {
    if (!open) {
      setConfirmText("")
      setSubmitting(false)
    }
  }, [open])

  const canConfirm = confirmText.trim() === expectedText

  const handleConfirm = async () => {
    if (!onConfirm || !canConfirm || submitting) {
      return
    }

    setSubmitting(true)

    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert className="size-5" aria-hidden />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-muted-foreground">
            请输入
            <span className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              {expectedText}
            </span>
            完成确认。
          </p>
          <div className="space-y-2">
            <Label htmlFor="danger-confirm-input">{inputLabel ?? `输入 ${expectedText}`}</Label>
            <Input
              id="danger-confirm-input"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={inputPlaceholder ?? expectedText}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || submitting || !onConfirm}
            className="cursor-pointer"
          >
            {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
