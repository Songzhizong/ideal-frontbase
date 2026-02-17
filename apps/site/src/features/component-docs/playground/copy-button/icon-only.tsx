import { CopyButton } from "@/packages/ui"

export function CopyButtonIconOnlyDemo() {
  return (
    <CopyButton
      value="sk-live-9xw2-example-token"
      iconOnly
      size="md"
      shape="square"
      variant="ghost"
      copyLabel="复制令牌"
      copiedLabel="已复制令牌"
    />
  )
}

export default CopyButtonIconOnlyDemo
