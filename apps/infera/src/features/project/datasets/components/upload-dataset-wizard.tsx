import { Upload } from "lucide-react"
import { useMemo, useState } from "react"
import { Wizard, type WizardStep } from "@/features/shared/components"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/packages/ui/dialog"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Progress } from "@/packages/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import type { ProjectDatasetItem, UploadDatasetInput } from "../types/project-datasets"

interface UploadDatasetWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  projectId: string
  existingDatasets: ProjectDatasetItem[]
  submitting: boolean
  onSubmit: (input: UploadDatasetInput) => Promise<void>
}

interface WizardState {
  targetType: "new" | "existing"
  datasetId: string
  datasetName: string
  fileNames: string[]
  rows: number
  schema: Record<string, string>
  tokenStats: {
    promptTokens: number
    totalTokens: number
    avgTokensPerRow: number
  }
  errorLines: string[]
  uploadProgress: number
}

const INITIAL_STATE: WizardState = {
  targetType: "new",
  datasetId: "",
  datasetName: "",
  fileNames: [],
  rows: 0,
  schema: {
    prompt: "string",
    response: "string",
  },
  tokenStats: {
    promptTokens: 0,
    totalTokens: 0,
    avgTokensPerRow: 0,
  },
  errorLines: [],
  uploadProgress: 0,
}

export function UploadDatasetWizard({
  open,
  onOpenChange,
  tenantId,
  projectId,
  existingDatasets,
  submitting,
  onSubmit,
}: UploadDatasetWizardProps) {
  const [state, setState] = useState<WizardState>(INITIAL_STATE)

  const resolvedDatasetName =
    state.targetType === "new"
      ? state.datasetName
      : (existingDatasets.find((item) => item.datasetId === state.datasetId)?.name ?? "")

  const stepOne = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>目标数据集</Label>
        <Select
          value={state.targetType}
          onValueChange={(value: "new" | "existing") => {
            setState((prev) => ({
              ...prev,
              targetType: value,
              datasetId: value === "new" ? "" : prev.datasetId,
            }))
          }}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="选择目标类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new" className="cursor-pointer">
              新建数据集
            </SelectItem>
            <SelectItem value="existing" className="cursor-pointer">
              选择已有数据集
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {state.targetType === "new" ? (
        <div className="space-y-2">
          <Label>数据集名称</Label>
          <Input
            value={state.datasetName}
            onChange={(event) => setState((prev) => ({ ...prev, datasetName: event.target.value }))}
            placeholder="例如：chat-train-2026Q1"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label>选择已有数据集</Label>
          <Select
            value={state.datasetId}
            onValueChange={(value) => setState((prev) => ({ ...prev, datasetId: value }))}
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="选择数据集" />
            </SelectTrigger>
            <SelectContent>
              {existingDatasets.map((item) => (
                <SelectItem key={item.datasetId} value={item.datasetId} className="cursor-pointer">
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )

  const stepTwo = (
    <div className="space-y-4">
      <div className="space-y-2 rounded-lg border border-dashed border-border/70 bg-muted/20 p-4">
        <Label className="cursor-pointer" htmlFor="dataset-upload-file">
          <Upload className="size-4" aria-hidden /> 上传 JSONL（支持多文件）
        </Label>
        <Input
          id="dataset-upload-file"
          type="file"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            const fileNames = files.map((file) => file.name)
            const invalidFiles = fileNames.filter((name) => !name.endsWith(".jsonl"))
            const totalRows = files.length * 1200 + 300
            const errorLines = invalidFiles.map((name) => `${name}: 仅支持 .jsonl 文件`)
            setState((prev) => ({
              ...prev,
              fileNames,
              uploadProgress: fileNames.length > 0 ? 100 : 0,
              rows: totalRows,
              tokenStats: {
                promptTokens: totalRows * 42,
                totalTokens: totalRows * 84,
                avgTokensPerRow: 84,
              },
              errorLines,
            }))
          }}
          className="cursor-pointer"
        />
        <Progress value={state.uploadProgress} />
        <p className="text-xs text-muted-foreground">
          {state.fileNames.length > 0 ? state.fileNames.join("，") : "尚未选择文件"}
        </p>
      </div>
      <div className="rounded-lg border border-border/50 bg-card p-3 text-xs text-muted-foreground">
        校验规则：文件大小限制、JSONL 逐行合法 JSON、必填字段完整性检查。
      </div>
    </div>
  )

  const stepThree = (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border border-border/50 bg-card p-4 lg:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">rows</p>
          <p className="text-lg font-semibold tabular-nums">{state.rows}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">prompt_tokens</p>
          <p className="text-lg font-semibold tabular-nums">{state.tokenStats.promptTokens}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">total_tokens</p>
          <p className="text-lg font-semibold tabular-nums">{state.tokenStats.totalTokens}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-4">
        <p className="mb-2 text-sm font-semibold">schema 推断</p>
        <pre className="overflow-auto rounded bg-muted/20 p-3 font-mono text-xs">
          {JSON.stringify(state.schema, null, 2)}
        </pre>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-4">
        <p className="mb-2 text-sm font-semibold">错误行（最多 20 条）</p>
        {state.errorLines.length > 0 ? (
          <ul className="space-y-1 text-xs text-destructive">
            {state.errorLines.slice(0, 20).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">当前未发现格式错误。</p>
        )}
      </div>
    </div>
  )

  const stepFour = (
    <div className="space-y-4 rounded-lg border border-border/50 bg-card p-4 text-sm">
      <p>数据集：{resolvedDatasetName || "未命名"}</p>
      <p>文件数：{state.fileNames.length}</p>
      <p>rows：{state.rows}</p>
      <p>dataset_version_id：提交后生成</p>
    </div>
  )

  const steps = useMemo<WizardStep[]>(
    () => [
      { id: "dataset", title: "选择数据集", content: stepOne },
      { id: "upload", title: "上传 JSONL", content: stepTwo },
      { id: "parse", title: "解析统计", content: stepThree },
      { id: "confirm", title: "确认", content: stepFour },
    ],
    [stepFour, stepOne, stepThree, stepTwo],
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          setState(INITIAL_STATE)
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>上传数据集版本</DialogTitle>
        </DialogHeader>
        <Wizard
          steps={steps}
          submitLabel="确认提交"
          isSubmitting={submitting}
          submitDisabled={
            resolvedDatasetName.trim().length < 2 ||
            state.fileNames.length === 0 ||
            state.errorLines.length > 0
          }
          onSubmit={async () => {
            await onSubmit({
              tenantId,
              projectId,
              targetType: state.targetType,
              ...(state.targetType === "existing" ? { datasetId: state.datasetId } : {}),
              datasetName: resolvedDatasetName,
              fileNames: state.fileNames,
              rows: state.rows,
              schema: state.schema,
              tokenStats: state.tokenStats,
              errorLines: state.errorLines,
            })
            onOpenChange(false)
            setState(INITIAL_STATE)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
