import { Activity, Download, FlaskConical } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AppSheetContent } from "@/packages/ui/app-sheet"
import { Button } from "@/packages/ui/button"
import { ScrollArea } from "@/packages/ui/scroll-area"
import { Sheet, SheetDescription, SheetHeader, SheetTitle } from "@/packages/ui/sheet"
import { Skeleton } from "@/packages/ui/skeleton"
import { Textarea } from "@/packages/ui/textarea"
import { cn } from "@/packages/ui-utils"
import type { ProjectModelItem } from "../types/project-models"
import { copyText, estimateLatency, inferModelType } from "./project-models-page.helpers"

interface ProjectModelsPlaygroundSheetProps {
  open: boolean
  model: ProjectModelItem | null
  onOpenChange: (open: boolean) => void
}

export function ProjectModelsPlaygroundSheet({
  open,
  model,
  onOpenChange,
}: ProjectModelsPlaygroundSheetProps) {
  const [prompt, setPrompt] = useState("请根据下面的上下文，返回一个 2 行以内的回答。")
  const [result, setResult] = useState("")
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    setResult("")
  }, [open])

  const runTest = async () => {
    if (!model) {
      return
    }
    if (prompt.trim().length === 0) {
      toast.error("请输入测试提示词")
      return
    }

    setIsTesting(true)
    await new Promise((resolve) => window.setTimeout(resolve, 720))
    setResult(
      `[${model.name}] 已完成模拟推理\n` +
        `Prompt Tokens: ${Math.min(2048, prompt.length * 2)}\n` +
        `Latency: ${estimateLatency(model, inferModelType(model))}ms\n` +
        "Result: 已返回结构化测试结果，建议继续在详情页进行多轮评估。",
    )
    setIsTesting(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent side="right" className="w-[720px] max-w-[96vw] p-0 sm:max-w-[720px]">
        <SheetHeader className="border-b border-border/50 px-6 py-5">
          <SheetTitle className="flex items-center gap-2">
            <FlaskConical className="size-4" aria-hidden />
            Playground 快速测试
          </SheetTitle>
          <SheetDescription>
            {model ? `模型：${model.name}` : "选择一个模型后可在此执行即时调试。"}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-108px)]">
          <div className="space-y-4 px-6 py-5">
            <div className="grid gap-3 rounded-xl border border-border/50 bg-card p-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">模型版本</p>
                <p className="font-mono text-sm">{model?.latestVersionId ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">调用来源</p>
                <p className="text-sm">{model?.source ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">预估延迟</p>
                <p className="text-sm tabular-nums">
                  {model ? `${estimateLatency(model, inferModelType(model))}ms` : "-"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Prompt</p>
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="min-h-32"
                placeholder="输入一段用于模型测试的提示词"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={() => {
                  void runTest()
                }}
                disabled={!model || isTesting}
                className="cursor-pointer"
              >
                <Activity className={cn("size-4", isTesting ? "animate-spin" : "")} aria-hidden />
                运行测试
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setResult("")}
              >
                清空结果
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer"
                onClick={() => {
                  if (result.length > 0) {
                    void copyText(result, "测试输出已复制")
                  }
                }}
              >
                <Download className="size-4" aria-hidden />
                复制输出
              </Button>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <p className="mb-2 text-sm font-medium">输出</p>
              {isTesting ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
                  {result.length > 0 ? result : "暂无输出，运行测试后可查看响应结果。"}
                </pre>
              )}
            </div>
          </div>
        </ScrollArea>
      </AppSheetContent>
    </Sheet>
  )
}
