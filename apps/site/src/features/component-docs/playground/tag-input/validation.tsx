import { useState } from "react"
import { TagInput } from "@/packages/ui"

export function TagInputValidationDemo() {
  const [error, setError] = useState("")

  return (
    <div className="grid w-full max-w-lg gap-2">
      <TagInput
        max={5}
        separator={[",", " "]}
        validateTag={(tag) => tag.length >= 2}
        onInvalidTag={(tag) => setError(`标签“${tag}”至少需要 2 个字符`)}
      />
      <p className="text-xs text-destructive">{error}</p>
    </div>
  )
}

export default TagInputValidationDemo
