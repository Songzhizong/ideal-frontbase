import { toast } from "sonner"
import { Button, Toaster } from "@/packages/ui"

export function SonnerPositionAndThemeDemo() {
  return (
    <div className="flex items-center gap-2">
      <Toaster
        id="sonner-bottom"
        position="bottom-left"
        richColors
        visibleToasts={2}
        duration={2500}
      />
      <Button
        color="secondary"
        onClick={() => {
          toast.success("任务完成", {
            description: "该 Toaster 位于左下角并启用了 richColors。",
            toasterId: "sonner-bottom",
          })
        }}
      >
        左下角样式
      </Button>
    </div>
  )
}

export default SonnerPositionAndThemeDemo
