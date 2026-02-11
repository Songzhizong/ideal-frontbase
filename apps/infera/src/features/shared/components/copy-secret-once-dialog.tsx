import { Check, Copy, KeyRound } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
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
import { Label } from "@/packages/ui/label"

export interface CopySecretOnceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  secret: string
  title?: string
  description?: string
  acknowledgeLabel?: string
  confirmLabel?: string
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  onConfirm?: () => void
}

export function CopySecretOnceDialog({
  open,
  onOpenChange,
  secret,
  title = "保存密钥",
  description = "该密钥仅展示一次，请立即复制并妥善保管。",
  acknowledgeLabel = "我已保存该密钥",
  confirmLabel = "完成",
  secondaryAction,
  onConfirm,
}: CopySecretOnceDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) {
      setAcknowledged(false)
      setCopied(false)
    }
  }, [open])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !acknowledged) {
      return
    }
    onOpenChange(nextOpen)
  }

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("当前环境不支持复制")
      return
    }

    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      toast.success("密钥已复制")
    } catch {
      toast.error("复制失败，请重试")
    }
  }

  const handleConfirm = () => {
    if (!acknowledged) {
      return
    }

    onConfirm?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={acknowledged} className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" aria-hidden />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-border/50 bg-muted/40 p-3">
            <p className="mb-2 text-xs text-muted-foreground">Secret</p>
            <p className="break-all rounded-md bg-background px-3 py-2 font-mono text-xs text-foreground">
              {secret}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            className="w-full cursor-pointer"
          >
            {copied ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
            {copied ? "已复制" : "复制密钥"}
          </Button>

          <div className="flex items-start gap-2 rounded-md border border-border/50 bg-card p-3">
            <Checkbox
              id="secret-saved-confirm"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
            />
            <Label
              htmlFor="secret-saved-confirm"
              className="cursor-pointer text-sm text-muted-foreground"
            >
              {acknowledgeLabel}
            </Label>
          </div>
        </div>

        <DialogFooter>
          {secondaryAction ? (
            <Button
              type="button"
              variant="outline"
              onClick={secondaryAction.onClick}
              className="cursor-pointer"
            >
              {secondaryAction.label}
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!acknowledged}
            className="cursor-pointer"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
