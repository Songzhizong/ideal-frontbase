import { ChevronLeftIcon } from "lucide-react"
import { Button, DirectionProvider } from "@/packages/ui"

export function DirectionRtlPreviewDemo() {
  return (
    <DirectionProvider dir="rtl" direction="rtl">
      <div className="flex items-center gap-2 rounded-md border border-border/50 p-3 text-sm">
        <Button size="sm" variant="outline">
          التالي
        </Button>
        <Button size="sm" variant="ghost">
          <ChevronLeftIcon className="size-4" />
          رجوع
        </Button>
      </div>
    </DirectionProvider>
  )
}

export default DirectionRtlPreviewDemo
