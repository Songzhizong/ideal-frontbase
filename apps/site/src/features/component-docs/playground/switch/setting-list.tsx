import { useState } from "react"
import { Switch } from "@/packages/ui"

const SETTINGS = [
  { key: "notify", label: "系统通知", desc: "接收部署和告警通知" },
  { key: "audit", label: "审计日志", desc: "记录高风险操作" },
  { key: "backup", label: "自动备份", desc: "每日凌晨自动备份" },
] as const

type SettingKey = (typeof SETTINGS)[number]["key"]

export function SwitchSettingListDemo() {
  const [state, setState] = useState<Record<SettingKey, boolean>>({
    notify: true,
    audit: true,
    backup: false,
  })

  return (
    <div className="grid w-full max-w-lg gap-2 rounded-md border border-border/50 p-3">
      {SETTINGS.map((setting) => (
        <div key={setting.key} className="flex items-start justify-between gap-3 rounded-sm p-2">
          <div className="grid gap-0.5">
            <p className="text-sm font-medium">{setting.label}</p>
            <p className="text-xs text-muted-foreground">{setting.desc}</p>
          </div>
          <Switch
            checked={state[setting.key]}
            onCheckedChange={(checked) => {
              setState((prev) => ({
                ...prev,
                [setting.key]: checked,
              }))
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default SwitchSettingListDemo
