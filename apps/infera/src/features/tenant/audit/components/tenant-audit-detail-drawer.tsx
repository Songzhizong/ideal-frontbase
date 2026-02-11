import { ChevronDown, Copy, Server, UserRound } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { IdBadge } from "@/features/shared/components"
import { DiffViewer } from "@/features/shared/components/diff-viewer"
import { AppSheetContent } from "@/packages/ui/app-sheet"
import { Button } from "@/packages/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/packages/ui/collapsible"
import { ScrollArea } from "@/packages/ui/scroll-area"
import { Separator } from "@/packages/ui/separator"
import { Sheet, SheetDescription, SheetHeader, SheetTitle } from "@/packages/ui/sheet"
import { Skeleton } from "@/packages/ui/skeleton"
import { formatTimestampToDateTime } from "@/packages/ui-utils/time-utils"
import { useTenantAuditLogDetailQuery } from "../hooks"
import type { TenantAuditActorType } from "../types/tenant-audit"

interface TenantAuditDetailDrawerProps {
  tenantId: string
  logId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatActorTypeLabel(actorType: TenantAuditActorType) {
  if (actorType === "service_account") {
    return "服务账号"
  }
  return "用户"
}

function formatJsonPayload(value: unknown) {
  if (value === null || value === undefined) {
    return "{}"
  }
  if (typeof value === "string") {
    if (!value.trim()) {
      return "{}"
    }
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function JsonBlock({ value }: { value: unknown }) {
  const text = useMemo(() => formatJsonPayload(value), [value])

  return (
    <div className="relative overflow-hidden rounded-lg border border-border/50 bg-muted/40">
      <div className="absolute right-3 top-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 cursor-pointer"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text)
              toast.success("已复制 JSON")
            } catch {
              toast.error("复制失败，请稍后重试")
            }
          }}
        >
          <Copy className="size-3.5" />
        </Button>
      </div>
      <pre className="max-h-80 overflow-auto p-4 pr-12 font-mono text-xs text-foreground">
        {text}
      </pre>
    </div>
  )
}

export function TenantAuditDetailDrawer({
  tenantId,
  logId,
  open,
  onOpenChange,
}: TenantAuditDetailDrawerProps) {
  const [beforeOpen, setBeforeOpen] = useState(false)
  const [afterOpen, setAfterOpen] = useState(false)
  const detailQuery = useTenantAuditLogDetailQuery(
    {
      tenantId,
      logId: logId ?? "",
    },
    open && Boolean(logId),
  )

  const data = detailQuery.data

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent side="right" className="w-[960px] max-w-[95vw] p-0 sm:max-w-[960px]">
        <SheetHeader className="border-b border-border/50 px-6 py-5">
          <SheetTitle>审计详情</SheetTitle>
          <SheetDescription>查看操作上下文与 before/after 变更细节。</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-108px)]">
          <div className="space-y-6 px-6 py-6">
            {detailQuery.isPending ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : detailQuery.isError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                审计详情加载失败，请关闭后重试。
              </div>
            ) : data ? (
              <>
                <div className="grid gap-3 rounded-lg border border-border/50 bg-card p-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">时间</p>
                    <p className="text-sm font-medium tabular-nums">
                      {formatTimestampToDateTime(data.happenedAtMs)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Actor</p>
                    <p className="text-sm font-medium">
                      {data.actorName ?? "-"}（{formatActorTypeLabel(data.actorType)}）
                    </p>
                    <p className="text-xs text-muted-foreground">{data.actorEmail}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">IP</p>
                    <p className="text-sm font-mono">{data.ip ?? "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">User-Agent</p>
                    <p className="text-sm break-all text-muted-foreground">
                      {data.userAgent ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-border/50 bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Server className="size-4" />
                    Resource
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">资源类型</p>
                      <p className="text-sm font-medium">{data.resourceType}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">资源 ID</p>
                      <IdBadge id={data.resourceId} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">资源名称</p>
                      <p className="text-sm">{data.resourceName ?? "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">项目</p>
                      <p className="text-sm">{data.projectName ?? "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-border/50 bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <UserRound className="size-4" />
                    Diff 变更视图
                  </div>
                  <DiffViewer
                    before={data.beforePayload}
                    after={data.afterPayload}
                    beforeTitle="Before"
                    afterTitle="After"
                    showDiffOnly={false}
                  />
                </div>

                <Collapsible
                  open={beforeOpen}
                  onOpenChange={setBeforeOpen}
                  className="rounded-lg border border-border/50 bg-card"
                >
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="text-sm font-semibold">Before JSON</span>
                      <ChevronDown
                        className={`size-4 transition-transform ${beforeOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Separator className="bg-border/50" />
                    <div className="p-4">
                      <JsonBlock value={data.beforePayload} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={afterOpen}
                  onOpenChange={setAfterOpen}
                  className="rounded-lg border border-border/50 bg-card"
                >
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="text-sm font-semibold">After JSON</span>
                      <ChevronDown
                        className={`size-4 transition-transform ${afterOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Separator className="bg-border/50" />
                    <div className="p-4">
                      <JsonBlock value={data.afterPayload} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </>
            ) : null}
          </div>
        </ScrollArea>
      </AppSheetContent>
    </Sheet>
  )
}
