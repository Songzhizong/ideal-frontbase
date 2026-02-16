import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { Button, ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/packages/ui"

export function ButtonGroupWithSeparatorTextDemo() {
  return (
    <ButtonGroup variant="outline" size="sm">
      <Button>上传</Button>
      <ButtonGroupSeparator />
      <ButtonGroupText>
        <CheckIcon className="size-4" />
        已选 12 项
      </ButtonGroupText>
      <Button>
        批量操作
        <ChevronDownIcon className="size-4" />
      </Button>
    </ButtonGroup>
  )
}

export default ButtonGroupWithSeparatorTextDemo
