import { LoaderCircle } from "lucide-react"
import { useState } from "react"
import { DiffViewer } from "@/features/shared/components/diff-viewer"
import { Button } from "@/packages/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"

export interface ReviewChangeItem {
  field: string
  before?: string
  after?: string
}

export interface ReviewChangesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  changes: ReviewChangeItem[]
  before?: unknown
  after?: unknown
  cancelLabel?: string
  confirmLabel?: string
  onConfirm?: () => void | Promise<void>
}

export function ReviewChangesDialog({
  open,
  onOpenChange,
  title = "确认变更",
  description = "请确认以下变更内容后再提交。",
  changes,
  before,
  after,
  cancelLabel = "取消",
  confirmLabel = "确认提交",
  onConfirm,
}: ReviewChangesDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const hasDiffPayload = before !== undefined || after !== undefined

  const handleConfirm = async () => {
    if (!onConfirm || submitting) {
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
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">字段</th>
                  <th className="px-3 py-2 text-left">变更前</th>
                  <th className="px-3 py-2 text-left">变更后</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change) => (
                  <tr
                    key={change.field}
                    className="border-t border-border/50 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-3 py-2 font-medium text-foreground">{change.field}</td>
                    <td className="px-3 py-2 text-muted-foreground">{change.before ?? "—"}</td>
                    <td className="px-3 py-2 text-foreground">{change.after ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasDiffPayload ? <DiffViewer before={before} after={after} /> : null}
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
            onClick={handleConfirm}
            disabled={submitting || !onConfirm}
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
