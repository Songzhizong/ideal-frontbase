import { Label, Textarea } from "@/packages/ui"

export function TextareaBasicDemo() {
  return (
    <div className="grid w-full max-w-md gap-2">
      <Label htmlFor="textarea-basic">问题描述</Label>
      <Textarea id="textarea-basic" placeholder="请描述你遇到的问题..." />
    </div>
  )
}

export default TextareaBasicDemo
