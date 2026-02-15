import { useState } from "react"
import { __COMPONENT_NAME__, Button } from "@/packages/ui"

export function __COMPONENT_NAME__FormIntegrationDemo() {
  const [value, setValue] = useState("")

  return (
    <div className="grid w-full max-w-sm gap-3">
      <__COMPONENT_NAME__ value={value} onChange={(event) => setValue(event.target.value)} />
      <Button disabled={!value}>提交</Button>
    </div>
  )
}

export default __COMPONENT_NAME__FormIntegrationDemo
