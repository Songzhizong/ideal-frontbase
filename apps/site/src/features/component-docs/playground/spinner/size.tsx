import { Spinner } from "@/packages/ui"

export function SpinnerSizeDemo() {
  return (
    <div className="flex items-center gap-3 text-muted-foreground">
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
    </div>
  )
}

export default SpinnerSizeDemo
