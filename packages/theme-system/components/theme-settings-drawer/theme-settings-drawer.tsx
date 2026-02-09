import { Copy, Palette, RotateCcw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/packages/ui/alert-dialog"
import { AppSheetContent } from "@/packages/ui/app-sheet"
import { Button } from "@/packages/ui/button"
import { Sheet, SheetDescription, SheetTitle, SheetTrigger } from "@/packages/ui/sheet"
import { useThemeStore } from "../../hooks/use-theme-store"
import { type ThemeModeImages, ThemeSettingsContent } from "./theme-settings-content"

export interface ThemeSettingsDrawerProps {
  modeImages?: Partial<ThemeModeImages>
}

export function ThemeSettingsDrawer({ modeImages }: ThemeSettingsDrawerProps) {
  const store = useThemeStore()
  const [showResetDialog, setShowResetDialog] = useState(false)

  const handleCopyConfig = () => {
    const config = {
      mode: store.mode,
      activePreset: store.activePreset,
      fontFamily: store.fontFamily,
      layout: store.layout,
      ui: store.ui,
    }

    const configStr = JSON.stringify(config, null, 2)
    navigator.clipboard.writeText(configStr).then(() => {
      toast.success("配置已复制到剪贴板", {
        description:
          "请将其粘贴到 src/config/theme-presets.ts 文件中的 defaultThemeSettings 常量中。",
      })
    })
  }

  const handleResetConfig = () => {
    store.reset()
    setShowResetDialog(false)
    toast.success("主题配置已重置")
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full p-0"
          aria-label="Open theme settings"
        >
          <Palette className="size-4" />
        </Button>
      </SheetTrigger>

      <AppSheetContent side="right" className="w-87.5 p-0 sm:w-100">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <SheetTitle className="text-lg font-semibold">主题配置</SheetTitle>
            <SheetDescription className="sr-only">
              调整系统的主题、颜色、布局等设置。
            </SheetDescription>
          </div>

          <ThemeSettingsContent store={store} {...(modeImages ? { modeImages } : {})} />

          <div className="flex gap-3 border-t border-border p-6">
            <Button className="flex-1 gap-2" onClick={handleCopyConfig}>
              <Copy className="h-4 w-4" />
              复制配置
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="h-4 w-4" />
              重置配置
            </Button>
          </div>
        </div>
      </AppSheetContent>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要重置所有设置吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将恢复所有主题设置到默认值，包括主题风格、颜色、布局等配置。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetConfig}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确定重置
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}
