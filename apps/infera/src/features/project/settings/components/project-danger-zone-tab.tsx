import { useState } from "react"
import { DangerConfirmDialog } from "@/features/shared/components"
import { Alert, AlertDescription } from "@/packages/ui/alert"
import { Button } from "@/packages/ui/button"
import type { ProjectOverview } from "../types/project-settings"

interface ProjectDangerZoneTabProps {
  overview: ProjectOverview
  deleting: boolean
  onDeleteProject: () => Promise<void>
}

export function ProjectDangerZoneTab({
  overview,
  deleting,
  onDeleteProject,
}: ProjectDangerZoneTabProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="space-y-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h3 className="text-base font-semibold text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">
          删除项目会清理项目内模型版本、数据集版本和运行中的服务配置，请谨慎操作。
        </p>
        <Alert className="border-destructive/40 bg-background">
          <AlertDescription className="text-sm">
            建议先在审计页面确认最近写操作，再执行删除。
          </AlertDescription>
        </Alert>
        <div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setOpen(true)}
            disabled={deleting}
            className="cursor-pointer"
          >
            删除项目
          </Button>
        </div>
      </div>

      <DangerConfirmDialog
        open={open}
        onOpenChange={setOpen}
        targetName={overview.projectName}
        title="确认删除项目"
        description="删除后不可恢复，请先确认项目内资源已经完成迁移。"
        confirmLabel="确认删除项目"
        onConfirm={onDeleteProject}
      />
    </>
  )
}
