import { useMemo, useState } from "react"
import { Checkbox, Label } from "@/packages/ui"

const OPTIONS = ["订单消息", "系统告警", "营销活动"] as const

export function CheckboxIndeterminateDemo() {
  const [selected, setSelected] = useState<string[]>(["订单消息"])
  const allChecked = selected.length === OPTIONS.length
  const partChecked = selected.length > 0 && !allChecked

  const parentChecked = useMemo(() => {
    if (allChecked) {
      return true
    }

    if (partChecked) {
      return "indeterminate" as const
    }

    return false
  }, [allChecked, partChecked])

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="checkbox-all"
          checked={parentChecked}
          onCheckedChange={(checked) => setSelected(checked ? [...OPTIONS] : [])}
        />
        <Label htmlFor="checkbox-all">全选通知渠道</Label>
      </div>

      <div className="grid gap-2 pl-6">
        {OPTIONS.map((item) => {
          const checked = selected.includes(item)
          return (
            <div key={item} className="flex items-center gap-2">
              <Checkbox
                id={`checkbox-${item}`}
                checked={checked}
                onCheckedChange={(nextChecked) => {
                  setSelected((prev) => {
                    if (nextChecked) {
                      return [...prev, item]
                    }

                    return prev.filter((current) => current !== item)
                  })
                }}
              />
              <Label htmlFor={`checkbox-${item}`}>{item}</Label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CheckboxIndeterminateDemo
