import { useState } from "react"
import { Button, Checkbox, Label } from "@/packages/ui"

const PERMISSIONS = ["读取工单", "编辑工单", "删除工单"] as const

export function CheckboxChecklistFormDemo() {
  const [checkedValues, setCheckedValues] = useState<string[]>([])

  return (
    <div className="grid w-full max-w-sm gap-3 rounded-md border border-border/50 p-3">
      {PERMISSIONS.map((permission) => {
        const checked = checkedValues.includes(permission)

        return (
          <div key={permission} className="flex items-center gap-2">
            <Checkbox
              id={`permission-${permission}`}
              checked={checked}
              onCheckedChange={(nextChecked) => {
                setCheckedValues((prev) => {
                  if (nextChecked) {
                    return [...prev, permission]
                  }

                  return prev.filter((current) => current !== permission)
                })
              }}
            />
            <Label htmlFor={`permission-${permission}`}>{permission}</Label>
          </div>
        )
      })}

      <Button disabled={checkedValues.length === 0}>保存权限</Button>
    </div>
  )
}

export default CheckboxChecklistFormDemo
