import { Label, Switch } from "@/packages/ui"

export function SwitchSizesDemo() {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Switch id="switch-default" defaultChecked />
        <Label htmlFor="switch-default">默认尺寸</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch-sm" size="sm" defaultChecked />
        <Label htmlFor="switch-sm">小尺寸</Label>
      </div>
    </div>
  )
}

export default SwitchSizesDemo
