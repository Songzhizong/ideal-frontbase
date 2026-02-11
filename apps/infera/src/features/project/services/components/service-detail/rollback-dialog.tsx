import { Button } from "@/packages/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { formatDateTime } from "../service-formatters"

interface RollbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  revisions: Array<{ revisionId: string; createdAt: string; status: string }>
  targetRevisionId: string
  onTargetChange: (revisionId: string) => void
  submitting: boolean
  onConfirm: () => Promise<void>
}

export function RollbackDialog({
  open,
  onOpenChange,
  revisions,
  targetRevisionId,
  onTargetChange,
  submitting,
  onConfirm,
}: RollbackDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>一键回滚</DialogTitle>
          <DialogDescription>选择目标 revision，确认后将切流 100%。</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>目标 Revision</Label>
          <Select value={targetRevisionId} onValueChange={onTargetChange}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {revisions.map((revision) => (
                <SelectItem
                  key={revision.revisionId}
                  value={revision.revisionId}
                  className="cursor-pointer"
                >
                  {revision.revisionId} · {revision.status} · {formatDateTime(revision.createdAt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={submitting}
            onClick={() => void onConfirm()}
          >
            确认回滚
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
