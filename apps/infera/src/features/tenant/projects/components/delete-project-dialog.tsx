import { LoaderCircle, TriangleAlert } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
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
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { cn } from "@/packages/ui-utils"
import type { TenantProjectDeletionPolicy, TenantProjectItem } from "../types/tenant-projects"

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: TenantProjectItem | null
  submitting: boolean
  onConfirm: (project: TenantProjectItem) => Promise<void>
}

const POLICY_META: Record<
  TenantProjectDeletionPolicy,
  { title: string; description: string; className: string }
> = {
  allow: {
    title: "可直接删除",
    description: "未检测到依赖资源，可直接执行删除。",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  },
  cascade: {
    title: "将级联删除",
    description: "删除项目时会同步删除以下关联资源，请确认无误后继续。",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  },
  blocked: {
    title: "当前策略禁止删除",
    description: "检测到关键依赖资源，需先清理资源后再执行删除。",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  submitting,
  onConfirm,
}: DeleteProjectDialogProps) {
  const [confirmText, setConfirmText] = useState("")

  useEffect(() => {
    if (!open) {
      setConfirmText("")
    }
  }, [open])

  const canSubmit = useMemo(() => {
    if (!project) {
      return false
    }

    if (project.deletionPreview.policy === "blocked") {
      return false
    }

    return confirmText.trim() === project.projectName
  }, [confirmText, project])

  const dependencies = project?.deletionPreview.dependencies ?? []
  const policy = project?.deletionPreview.policy ?? "allow"
  const policyMeta = POLICY_META[policy]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert className="size-5" aria-hidden />
            删除项目
          </DialogTitle>
          <DialogDescription>删除后无法恢复，请确认项目已完成迁移或不再使用。</DialogDescription>
        </DialogHeader>

        <div className={cn("rounded-md border px-3 py-2 text-sm", policyMeta.className)}>
          <p className="font-medium">{policyMeta.title}</p>
          <p className="mt-1 text-xs opacity-90">{policyMeta.description}</p>
        </div>

        {dependencies.length > 0 ? (
          <div className="space-y-2 rounded-md border border-border/50 bg-muted/20 p-3">
            <p className="text-sm font-medium text-foreground">依赖资源清单</p>
            <ul className="space-y-1 text-sm">
              {dependencies.map((dependency) => (
                <li
                  key={dependency.id}
                  className="flex items-center justify-between gap-2 rounded border border-border/40 bg-card px-2 py-1.5"
                >
                  <span className="min-w-0 truncate text-muted-foreground">
                    {dependency.resourceType} · {dependency.resourceName}
                  </span>
                  {dependency.to ? (
                    <BaseLink
                      to={dependency.to}
                      className="cursor-pointer shrink-0 text-xs text-primary hover:underline"
                    >
                      查看
                    </BaseLink>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <Label htmlFor="delete-project-confirm" className="text-sm">
            请输入项目名称
            <span className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              {project?.projectName ?? ""}
            </span>
            确认删除
          </Label>
          <Input
            id="delete-project-confirm"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={project?.projectName ?? ""}
            className="cursor-text"
          />
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
            variant="destructive"
            disabled={!project || !canSubmit || submitting}
            onClick={() => {
              if (!project) {
                return
              }

              void onConfirm(project)
            }}
            className="cursor-pointer"
          >
            {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
