import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/packages/ui"

export function InputGroupTextareaActionsDemo() {
  return (
    <InputGroup className="max-w-lg">
      <InputGroupTextarea rows={4} placeholder="请输入变更说明..." />
      <InputGroupAddon align="block-end" className="border-t border-border/50">
        <InputGroupText>支持 Markdown</InputGroupText>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            预览
          </Button>
          <Button size="sm">提交</Button>
        </div>
      </InputGroupAddon>
    </InputGroup>
  )
}

export default InputGroupTextareaActionsDemo
