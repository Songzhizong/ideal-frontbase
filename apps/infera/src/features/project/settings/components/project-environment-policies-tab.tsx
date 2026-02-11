import { Button } from "@/packages/ui/button"
import { Switch } from "@/packages/ui/switch"
import type { ProjectEnvironmentPolicies } from "../types/project-settings"

interface PolicyItem {
  key: keyof ProjectEnvironmentPolicies
  title: string
  description: string
}

interface ProjectEnvironmentPoliciesTabProps {
  policies: ProjectEnvironmentPolicies
  saving: boolean
  onChange: (next: ProjectEnvironmentPolicies) => void
  onSave: () => Promise<void>
}

const POLICY_ITEMS: readonly PolicyItem[] = [
  {
    key: "disableScaleToZeroInProd",
    title: "Prod 禁止 Scale-to-Zero",
    description: "生产环境保持实例常驻，避免冷启动对线上请求造成影响。",
  },
  {
    key: "requireAlertsInProd",
    title: "Prod 强制启用告警",
    description: "生产项目的核心指标必须配置告警规则，防止异常扩散。",
  },
  {
    key: "disablePlaygroundLoggingInProd",
    title: "Prod 禁止 Playground 记录",
    description: "默认不记录 prompt/response，降低敏感数据留存风险。",
  },
  {
    key: "forbidViewerLogs",
    title: "Viewer 禁止查看日志",
    description: "强化最小权限原则，仅 Owner/Developer 可访问详细日志。",
  },
]

export function ProjectEnvironmentPoliciesTab({
  policies,
  saving,
  onChange,
  onSave,
}: ProjectEnvironmentPoliciesTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {POLICY_ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-4 transition-colors hover:bg-muted/20"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              checked={policies[item.key]}
              onCheckedChange={(checked) => {
                onChange({
                  ...policies,
                  [item.key]: checked,
                })
              }}
              className="cursor-pointer"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onSave} disabled={saving} className="cursor-pointer">
          保存策略
        </Button>
      </div>
    </div>
  )
}
