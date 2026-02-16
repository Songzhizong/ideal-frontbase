import { Checkbox, Label } from "@/packages/ui"

export function CheckboxBasicDemo() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-basic" />
      <Label htmlFor="checkbox-basic">我已阅读并同意服务条款</Label>
    </div>
  )
}

export default CheckboxBasicDemo
