import { Button, Spinner } from "@/packages/ui"

export function SpinnerInlineWithTextDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled>
        <Spinner className="mr-2 size-4" />
        正在提交
      </Button>
      <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        正在同步数据...
      </p>
    </div>
  )
}

export default SpinnerInlineWithTextDemo
