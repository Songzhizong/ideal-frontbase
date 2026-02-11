import { useEffect, useState } from "react"
import { IdBadge } from "@/features/shared/components"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Textarea } from "@/packages/ui/textarea"
import type { ProjectOverview } from "../types/project-settings"

interface ProjectSettingsOverviewTabProps {
  overview: ProjectOverview
  onSave: (input: {
    projectName: string
    environment: ProjectOverview["environment"]
    description: string
  }) => Promise<void>
  saving: boolean
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("zh-CN", { hour12: false })
}

export function ProjectSettingsOverviewTab({
  overview,
  onSave,
  saving,
}: ProjectSettingsOverviewTabProps) {
  const [projectName, setProjectName] = useState(overview.projectName)
  const [environment, setEnvironment] = useState<ProjectOverview["environment"]>(
    overview.environment,
  )
  const [description, setDescription] = useState(overview.description)

  useEffect(() => {
    setProjectName(overview.projectName)
    setEnvironment(overview.environment)
    setDescription(overview.description)
  }, [overview.description, overview.environment, overview.projectName])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-xl border border-border/50 bg-card p-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">项目 ID</p>
          <IdBadge id={overview.projectId} />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">创建信息</p>
          <p className="text-sm text-foreground">创建人：{overview.createdBy}</p>
          <p className="text-xs text-muted-foreground">
            创建时间：{formatDateTime(overview.createdAt)}
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/50 bg-card p-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project-name">项目名称</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              maxLength={64}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-env">环境标签</Label>
            <Select
              value={environment}
              onValueChange={(value: ProjectOverview["environment"]) => setEnvironment(value)}
            >
              <SelectTrigger id="project-env" className="w-full cursor-pointer">
                <SelectValue placeholder="选择环境" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dev" className="cursor-pointer">
                  Dev
                </SelectItem>
                <SelectItem value="Test" className="cursor-pointer">
                  Test
                </SelectItem>
                <SelectItem value="Prod" className="cursor-pointer">
                  Prod
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-description">描述</Label>
          <Textarea
            id="project-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="描述当前项目目标、资源边界与治理约束"
            rows={4}
            maxLength={200}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            disabled={saving || projectName.trim().length < 2}
            onClick={async () => {
              await onSave({
                projectName,
                environment,
                description,
              })
            }}
            className="cursor-pointer"
          >
            保存概览
          </Button>
        </div>
      </div>
    </div>
  )
}
