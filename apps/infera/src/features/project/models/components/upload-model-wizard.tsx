import { Upload } from "lucide-react"
import { useMemo, useState } from "react"
import { Wizard, type WizardStep } from "@/features/shared/components"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/packages/ui/dialog"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Progress } from "@/packages/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Textarea } from "@/packages/ui/textarea"
import type {
  ModelArtifactType,
  ModelFormat,
  ModelVisibility,
  ProjectModelItem,
  UploadModelInput,
} from "../types/project-models"
import { INITIAL_UPLOAD_MODEL_FORM, type UploadFormState } from "./upload-model-wizard.state"

interface UploadModelWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  projectId: string
  existingModels: ProjectModelItem[]
  submitting: boolean
  onSubmit: (input: UploadModelInput) => Promise<void>
}

export function UploadModelWizard({
  open,
  onOpenChange,
  tenantId,
  projectId,
  existingModels,
  submitting,
  onSubmit,
}: UploadModelWizardProps) {
  const [form, setForm] = useState<UploadFormState>(INITIAL_UPLOAD_MODEL_FORM)

  const resolvedModelName =
    form.targetType === "new"
      ? form.modelName
      : (existingModels.find((item) => item.modelId === form.modelId)?.name ?? "")

  const stepOne = (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <Label>目标类型</Label>
          <Select
            value={form.targetType}
            onValueChange={(value: "new" | "existing") => {
              setForm((prev) => ({
                ...prev,
                targetType: value,
                modelId: value === "new" ? "" : prev.modelId,
              }))
            }}
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="选择目标类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new" className="cursor-pointer">
                新建模型
              </SelectItem>
              <SelectItem value="existing" className="cursor-pointer">
                已有模型新增版本
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.targetType === "existing" ? (
          <div className="space-y-2">
            <Label>选择模型</Label>
            <Select
              value={form.modelId}
              onValueChange={(value) => setForm((prev) => ({ ...prev, modelId: value }))}
            >
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                {existingModels.map((item) => (
                  <SelectItem key={item.modelId} value={item.modelId} className="cursor-pointer">
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>模型名称</Label>
            <Input
              value={form.modelName}
              onChange={(event) => setForm((prev) => ({ ...prev, modelName: event.target.value }))}
              placeholder="例如：Chat LLM Pro"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Visibility</Label>
        <Select
          value={form.visibility}
          onValueChange={(value: ModelVisibility) =>
            setForm((prev) => ({ ...prev, visibility: value }))
          }
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Private" className="cursor-pointer">
              Private
            </SelectItem>
            <SelectItem value="TenantShared" className="cursor-pointer">
              TenantShared
            </SelectItem>
            <SelectItem value="Public" className="cursor-pointer">
              Public
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>描述</Label>
        <Textarea
          rows={4}
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="描述模型用途、版本策略和注意事项"
        />
      </div>
    </div>
  )

  const stepTwo = (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <Label>上传方式</Label>
          <Select
            value={form.uploadMode}
            onValueChange={(value: "web" | "cli") =>
              setForm((prev) => ({ ...prev, uploadMode: value }))
            }
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web" className="cursor-pointer">
                Web Upload
              </SelectItem>
              <SelectItem value="cli" className="cursor-pointer">
                CLI Upload
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>格式</Label>
          <Select
            value={form.format}
            onValueChange={(value: ModelFormat) => setForm((prev) => ({ ...prev, format: value }))}
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="safetensors" className="cursor-pointer">
                safetensors
              </SelectItem>
              <SelectItem value="gguf" className="cursor-pointer">
                gguf
              </SelectItem>
              <SelectItem value="bin" className="cursor-pointer">
                bin
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-dashed border-border/70 bg-muted/20 p-4">
        <Label className="cursor-pointer" htmlFor="model-upload-file">
          <Upload className="size-4" aria-hidden /> 选择模型文件
        </Label>
        <Input
          id="model-upload-file"
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) {
              return
            }
            setForm((prev) => ({
              ...prev,
              uploadFileName: file.name,
              uploadSizeLabel: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              uploadProgress: 95,
            }))
          }}
          className="cursor-pointer"
        />
        <Progress value={form.uploadProgress} />
        <p className="text-xs text-muted-foreground">
          {form.uploadFileName
            ? `${form.uploadFileName} · ${form.uploadSizeLabel}`
            : "尚未选择文件"}
        </p>
      </div>
    </div>
  )

  const stepThree = (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <Label>artifact_type</Label>
          <Select
            value={form.artifactType}
            onValueChange={(value: ModelArtifactType) =>
              setForm((prev) => ({ ...prev, artifactType: value }))
            }
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full" className="cursor-pointer">
                Full
              </SelectItem>
              <SelectItem value="Adapter" className="cursor-pointer">
                Adapter
              </SelectItem>
              <SelectItem value="Merged" className="cursor-pointer">
                Merged
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>base_model_version_id</Label>
          <Input
            value={form.baseModelVersionId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, baseModelVersionId: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>参数量</Label>
          <Input
            value={form.parameterSize}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, parameterSize: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>上下文长度</Label>
          <Input
            type="number"
            value={form.contextLength}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, contextLength: Number(event.target.value || 0) }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>license</Label>
          <Input
            value={form.license}
            onChange={(event) => setForm((prev) => ({ ...prev, license: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>quantization</Label>
          <Input
            value={form.quantization}
            onChange={(event) => setForm((prev) => ({ ...prev, quantization: event.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>metadata notes</Label>
        <Textarea
          rows={3}
          value={form.notes}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
        />
      </div>
    </div>
  )

  const stepFour = (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card p-4 text-sm">
      <div className="grid gap-2 lg:grid-cols-2">
        <p>模型：{resolvedModelName || "未命名"}</p>
        <p>格式：{form.format}</p>
        <p>artifact_type：{form.artifactType}</p>
        <p>sha256：sha256-将在提交后生成</p>
        <p>size：{form.uploadSizeLabel}</p>
        <p>model_version_id：提交后生成</p>
      </div>
      {form.uploadProgress < 100 ? (
        <p className="text-xs text-muted-foreground">上传过程可重试，提交前将自动完成校验。</p>
      ) : null}
    </div>
  )

  const steps = useMemo<WizardStep[]>(
    () => [
      { id: "target", title: "选择目标", content: stepOne },
      { id: "upload", title: "上传方式", content: stepTwo },
      { id: "metadata", title: "版本信息", content: stepThree },
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
          setForm(INITIAL_UPLOAD_MODEL_FORM)
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>上传模型</DialogTitle>
        </DialogHeader>
        <Wizard
          steps={steps}
          submitLabel="提交上传"
          isSubmitting={submitting}
          submitDisabled={
            resolvedModelName.trim().length < 2 ||
            (form.uploadMode === "web" && form.uploadFileName.trim().length === 0)
          }
          onSubmit={async () => {
            await onSubmit({
              tenantId,
              projectId,
              targetType: form.targetType,
              ...(form.targetType === "existing" ? { modelId: form.modelId } : {}),
              modelName: resolvedModelName,
              visibility: form.visibility,
              description: form.description,
              uploadMode: form.uploadMode,
              format: form.format,
              artifactType: form.artifactType,
              baseModelVersionId: form.baseModelVersionId,
              parameterSize: form.parameterSize,
              contextLength: form.contextLength,
              license: form.license,
              quantization: form.quantization,
              notes: form.notes,
              uploadFileName: form.uploadFileName || "cli-uploaded-artifact",
              uploadSizeLabel: form.uploadSizeLabel,
            })
            onOpenChange(false)
            setForm(INITIAL_UPLOAD_MODEL_FORM)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
