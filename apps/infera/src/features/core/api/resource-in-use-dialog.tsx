import * as React from "react"
import { create } from "zustand"
import type { ResourceInUsePayload } from "@/features/core/api/http-client"
import { BaseLink } from "@/packages/platform-router"
import { Button } from "@/packages/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"

interface ResourceInUseDialogState {
  open: boolean
  payload: ResourceInUsePayload | null
  show: (payload: ResourceInUsePayload) => void
  hide: () => void
}

const useResourceInUseDialogStore = create<ResourceInUseDialogState>((set) => ({
  open: false,
  payload: null,
  show: (payload) => {
    set({
      open: true,
      payload,
    })
  },
  hide: () => {
    set({
      open: false,
    })
  },
}))

function isExternalLink(to: string) {
  return to.startsWith("http://") || to.startsWith("https://")
}

function renderJumpLink(to: string) {
  if (isExternalLink(to)) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noreferrer"
        className="cursor-pointer text-primary transition-colors hover:text-primary/80"
      >
        打开链接
      </a>
    )
  }

  const normalizedTo = to.startsWith("/") ? to : `/${to}`

  return (
    <BaseLink
      to={normalizedTo}
      className="cursor-pointer text-primary transition-colors hover:text-primary/80"
    >
      查看详情
    </BaseLink>
  )
}

export function showResourceInUseDialog(payload: ResourceInUsePayload) {
  useResourceInUseDialogStore.getState().show(payload)
}

export function ResourceInUseDialog() {
  const open = useResourceInUseDialogStore((state) => state.open)
  const payload = useResourceInUseDialogStore((state) => state.payload)
  const hide = useResourceInUseDialogStore((state) => state.hide)

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        hide()
      }
    },
    [hide],
  )

  const dependencies = payload?.dependencies ?? []

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{payload?.title ?? "资源正在被依赖，无法完成当前操作"}</DialogTitle>
          <DialogDescription>
            {payload?.description ?? "请先处理依赖项后再重试。"}
          </DialogDescription>
        </DialogHeader>

        {dependencies.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Service</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Revision</th>
                  <th className="px-3 py-2 text-left">Env</th>
                  <th className="px-3 py-2 text-left">Traffic</th>
                  <th className="px-3 py-2 text-left">Endpoint</th>
                  <th className="px-3 py-2 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {dependencies.map((dependency) => (
                  <tr
                    key={dependency.key}
                    className="border-t border-border/50 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-3 py-2 font-medium text-foreground">
                      {dependency.serviceName}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{dependency.resourceType}</td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {dependency.revisionId ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {dependency.environment ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {dependency.trafficWeight ?? "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {dependency.endpoint ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      {dependency.to ? (
                        renderJumpLink(dependency.to)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            后端未返回依赖明细，请在资源详情页或审计日志中进一步排查引用关系。
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={hide} className="cursor-pointer">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
