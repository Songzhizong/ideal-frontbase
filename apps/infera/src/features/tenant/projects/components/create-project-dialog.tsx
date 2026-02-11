import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, LoaderCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/packages/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { RadioGroup, RadioGroupItem } from "@/packages/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Textarea } from "@/packages/ui/textarea"
import {
  type CreateTenantProjectInput,
  TENANT_PROJECT_ENVIRONMENTS,
  type TenantProjectMemberCandidate,
} from "../types/tenant-projects"
import { normalizeProjectName } from "../utils/tenant-projects-formatters"
import {
  type InitialMemberSelection,
  ProjectInitialMembersSelector,
} from "./project-initial-members-selector"

const CreateProjectFormSchema = z
  .object({
    name: z.string().min(2, "项目名称至少 2 个字符").max(64, "项目名称最多 64 个字符"),
    environment: z.enum(TENANT_PROJECT_ENVIRONMENTS),
    description: z.string().max(200, "项目描述最多 200 个字符"),
    quotaPolicyMode: z.enum(["tenant_default", "custom"]),
    quotaPolicyJson: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.quotaPolicyMode !== "custom") {
      return
    }

    const normalizedJson = value.quotaPolicyJson.trim()
    if (normalizedJson.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quotaPolicyJson"],
        message: "自定义策略不能为空",
      })
      return
    }

    try {
      JSON.parse(normalizedJson)
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quotaPolicyJson"],
        message: "JSON 格式无效，请检查后重试",
      })
    }
  })

type CreateProjectFormValues = z.infer<typeof CreateProjectFormSchema>

const DEFAULT_FORM_VALUES: CreateProjectFormValues = {
  name: "",
  environment: "Dev",
  description: "",
  quotaPolicyMode: "tenant_default",
  quotaPolicyJson: "",
}

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  canCreateProject: boolean
  existingProjectNames: readonly string[]
  memberCandidates: readonly TenantProjectMemberCandidate[]
  submitting: boolean
  onSubmit: (input: Omit<CreateTenantProjectInput, "tenantId">) => Promise<void>
}

function normalizeExistingProjectNames(existingProjectNames: readonly string[]) {
  return new Set(existingProjectNames.map((name) => normalizeProjectName(name)))
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  canCreateProject,
  existingProjectNames,
  memberCandidates,
  submitting,
  onSubmit,
}: CreateProjectDialogProps) {
  const [selectedMembers, setSelectedMembers] = useState<InitialMemberSelection[]>([])

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(CreateProjectFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  })

  const environment = form.watch("environment")
  const quotaPolicyMode = form.watch("quotaPolicyMode")
  const projectName = form.watch("name")

  const existingProjectNameSet = useMemo(() => {
    return normalizeExistingProjectNames(existingProjectNames)
  }, [existingProjectNames])

  const duplicatedProjectName =
    normalizeProjectName(projectName).length > 0 &&
    existingProjectNameSet.has(normalizeProjectName(projectName))

  useEffect(() => {
    if (duplicatedProjectName) {
      form.setError("name", {
        type: "validate",
        message: "项目名称已存在，请更换后重试",
      })
      return
    }

    if (form.formState.errors.name?.type === "validate") {
      form.clearErrors("name")
    }
  }, [duplicatedProjectName, form])

  useEffect(() => {
    if (open) {
      return
    }

    form.reset(DEFAULT_FORM_VALUES)
    setSelectedMembers([])
  }, [form, open])

  const handleSubmit = form.handleSubmit(async (values) => {
    if (duplicatedProjectName) {
      form.setError("name", {
        type: "validate",
        message: "项目名称已存在，请更换后重试",
      })
      return
    }

    await onSubmit({
      name: values.name.trim(),
      environment: values.environment,
      description: values.description.trim(),
      quotaPolicyMode: values.quotaPolicyMode,
      quotaPolicyJson: values.quotaPolicyMode === "custom" ? values.quotaPolicyJson.trim() : null,
      initialMembers: selectedMembers,
    })

    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建项目</DialogTitle>
          <DialogDescription>
            创建后会进入对应租户上下文，可继续配置服务、模型和数据集。
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="project-name">项目名称</Label>
              <Input
                id="project-name"
                placeholder="例如：Chat Gateway"
                className="cursor-text"
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">2-64 个字符，需在租户内保持唯一</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-environment">环境标签</Label>
              <Controller
                name="environment"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="project-environment" className="cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TENANT_PROJECT_ENVIRONMENTS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">项目描述（可选）</Label>
              <Textarea
                id="project-description"
                rows={3}
                maxLength={200}
                placeholder="描述项目用途、目标业务和协作边界"
                className="cursor-text"
                {...form.register("description")}
              />
              <p className="text-xs text-muted-foreground">
                {form.watch("description").length}/200
              </p>
            </div>
          </div>

          {environment === "Prod" ? (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              <p className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="size-4" aria-hidden />
                Prod 项目将默认启用更严格策略
              </p>
              <p className="mt-1 text-xs text-red-500/90">包括配额、操作审核与部署准入限制。</p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>项目配额策略</Label>
            <Controller
              name="quotaPolicyMode"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-2"
                >
                  <Label className="flex cursor-pointer items-center gap-2 rounded-md border border-border/50 p-3">
                    <RadioGroupItem value="tenant_default" className="cursor-pointer" />
                    <span className="space-y-0.5">
                      <span className="block text-sm font-medium text-foreground">
                        使用租户默认策略
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        继承租户配额与预算配置，推荐作为默认方案。
                      </span>
                    </span>
                  </Label>
                  <Label className="flex cursor-pointer items-center gap-2 rounded-md border border-border/50 p-3">
                    <RadioGroupItem value="custom" className="cursor-pointer" />
                    <span className="space-y-0.5">
                      <span className="block text-sm font-medium text-foreground">
                        自定义策略（高级）
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        适用于特定项目，需填写合法 JSON。
                      </span>
                    </span>
                  </Label>
                </RadioGroup>
              )}
            />
          </div>

          {quotaPolicyMode === "custom" ? (
            <div className="space-y-2">
              <Label htmlFor="project-quota-policy">自定义策略 JSON</Label>
              <Textarea
                id="project-quota-policy"
                rows={6}
                placeholder='例如：{"dailyTokenLimit": 2000000, "maxServices": 10}'
                className="font-mono text-xs"
                {...form.register("quotaPolicyJson")}
              />
              {form.formState.errors.quotaPolicyJson ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.quotaPolicyJson.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">保存后将在创建确认中展示差异摘要。</p>
              )}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>初始成员（可选）</Label>
            <ProjectInitialMembersSelector
              candidates={memberCandidates}
              value={selectedMembers}
              onChange={setSelectedMembers}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={() => {
              void handleSubmit()
            }}
            disabled={!canCreateProject || submitting}
            className="cursor-pointer"
          >
            {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
            创建项目
          </Button>
        </DialogFooter>

        {!canCreateProject ? (
          <p className="text-xs text-muted-foreground">当前租户策略不允许创建项目。</p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
