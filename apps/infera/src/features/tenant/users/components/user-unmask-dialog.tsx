import { Badge } from "@/packages/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"
import { Skeleton } from "@/packages/ui/skeleton"
import { formatTimestampToDateTime } from "@/packages/ui-utils/time-utils"
import type { Api } from "../api/user-management"

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[92px_1fr] items-start gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="min-w-0 break-all text-sm text-foreground">{value || "-"}</div>
    </div>
  )
}

interface UserUnmaskDialogProps {
  open: boolean
  loading: boolean
  detail: Api.User.UserDetail | null
  onOpenChange: (open: boolean) => void
}

export function UserUnmaskDialog({ open, loading, detail, onOpenChange }: UserUnmaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>查看明文信息</DialogTitle>
          <DialogDescription>已展示该用户当前的未脱敏账号信息。</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : detail ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-base font-semibold text-foreground">{detail.name}</div>
              {detail.blocked ? (
                <Badge variant="destructive">已锁定</Badge>
              ) : (
                <Badge variant="secondary">正常</Badge>
              )}
              {detail.mfaEnabled ? <Badge variant="outline">MFA 已开启</Badge> : null}
            </div>
            <DetailField label="账号" value={detail.account ?? null} />
            <DetailField label="完整账号" value={detail.fullAccount ?? null} />
            <DetailField label="邮箱" value={detail.email ?? null} />
            <DetailField label="手机号" value={detail.phone ?? null} />
            <DetailField label="创建时间" value={formatTimestampToDateTime(detail.createdTime)} />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            暂无可展示数据
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
