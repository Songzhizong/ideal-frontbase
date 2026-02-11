import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, ArrowRight, Check, LoaderCircle, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { useAuthStore } from "@/packages/auth-core/auth-store"
import { Button } from "@/packages/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/packages/ui/dialog"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Textarea } from "@/packages/ui/textarea"
import { cn } from "@/packages/ui-utils"
import {
  type CreateTenantProjectInput,
  TENANT_PROJECT_ENVIRONMENTS,
  type TenantProjectMemberCandidate,
} from "../types/tenant-projects"
import { normalizeProjectName } from "../utils/tenant-projects-formatters"
import type { InitialMemberSelection } from "./project-initial-members-selector"
import { ProjectMemberManager } from "./project-member-manager"
import { ProjectQuotaStrategyField } from "./project-quota-strategy-field"

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

const STEPS = [
  { id: 1, title: "基础配置" },
  { id: 2, title: "成员管理" },
]

export function CreateProjectDialog({
  open,
  onOpenChange,
  canCreateProject,
  existingProjectNames,
  memberCandidates,
  submitting,
  onSubmit,
}: CreateProjectDialogProps) {
  const { user: currentUser } = useAuthStore()
  const shouldAnimate = !useReducedMotion()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1) // 1: next, -1: prev

  const modalEnterMotionProps = shouldAnimate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      }
    : {}

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  }

  const [selectedMembers, setSelectedMembers] = useState<InitialMemberSelection[]>([])

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(CreateProjectFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
  })

  const environment = form.watch("environment")
  const quotaPolicyMode = form.watch("quotaPolicyMode")
  const projectName = form.watch("name")
  const description = form.watch("description")

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
      // Initialize selected members with current user as Owner if possible
      if (currentUser) {
        // Check if current user is in candidates to get correct role/info, usually they should be
        const currentUserCandidate = memberCandidates.find((c) => c.userId === currentUser.userId)
        if (currentUserCandidate) {
          setSelectedMembers([
            {
              userId: currentUser.userId,
              role: "Owner", // Default to Owner
            },
          ])
        }
      }
      return
    }

    form.reset(DEFAULT_FORM_VALUES)
    setSelectedMembers([])
    setStep(1)
    setDirection(1)
  }, [form, open, currentUser, memberCandidates])

  const environmentColorMap: Record<string, string> = {
    Dev: "bg-slate-100 text-slate-600 border-slate-200",
    Test: "bg-orange-50 text-orange-600 border-orange-100",
    Prod: "bg-red-50 text-red-600 border-red-100",
  }

  const handleNextStep = async () => {
    // Step 1 contains all the form fields, so we can validate the entire form.
    const isValid = await form.trigger()
    if (isValid && !duplicatedProjectName) {
      setDirection(1)
      setStep(2)
    }
  }

  const handlePrevStep = () => {
    setDirection(-1)
    setStep(1)
  }

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
      <DialogPortal>
        <DialogOverlay className="bg-overlay/45 backdrop-blur-sm" />

        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[min(720px,calc(100%-1.5rem))] max-h-[92vh]",
            "-translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-border/60",
            "bg-card p-0 shadow-2xl outline-none",
          )}
        >
          <motion.div
            {...modalEnterMotionProps}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex min-h-0 max-h-[92vh] flex-col"
          >
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-4 right-4 z-10 cursor-pointer rounded-full opacity-70 hover:bg-muted hover:opacity-100"
              >
                <X className="size-4" aria-hidden />
                <span className="sr-only">关闭弹窗</span>
              </Button>
            </DialogClose>

            <DialogHeader className="gap-0 border-b border-border/40 px-6 pt-6 pb-4 text-left">
              <div className="mb-4">
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground/90">
                  创建项目
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs">
                  几秒钟内启动您的新项目空间。
                </DialogDescription>
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-2">
                {STEPS.map((s, index) => {
                  const isActive = step === s.id
                  const isCompleted = step > s.id
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary"
                            : isCompleted
                              ? "bg-muted/50 text-muted-foreground border-transparent"
                              : "bg-transparent text-muted-foreground border-transparent",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-3.5 items-center justify-center rounded-full text-[9px]",
                            isActive ? "bg-background/20" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {isCompleted ? <Check className="size-2" /> : s.id}
                        </span>
                        {s.title}
                      </div>
                      {index < STEPS.length - 1 && <div className="h-px w-6 bg-border/40" />}
                    </div>
                  )
                })}
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="relative h-[460px] min-h-0 w-full overflow-hidden bg-muted/5">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step-1"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute inset-0 overflow-y-auto px-6 py-5"
                    >
                      <div className="space-y-5">
                        {/* Project Name & Environment Grid */}
                        <div className="grid grid-cols-[1fr_140px] gap-4 items-start">
                          <div className="space-y-1.5 relative">
                            <Label htmlFor="project-name" className="text-xs text-muted-foreground">
                              项目名称
                            </Label>
                            <Input
                              id="project-name"
                              placeholder="例如：Chat Gateway"
                              className="cursor-text"
                              {...form.register("name")}
                            />
                            <span
                              className={cn(
                                "absolute right-1 top-7 text-[10px] pointer-events-none px-2 py-0.5 bg-background/50 rounded",
                                projectName.length > 64
                                  ? "text-destructive"
                                  : "text-muted-foreground",
                              )}
                            >
                              {projectName.length}/64
                            </span>
                            {form.formState.errors.name && (
                              <p className="text-xs text-destructive mt-1">
                                {form.formState.errors.name.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label
                              htmlFor="project-environment"
                              className="text-xs text-muted-foreground"
                            >
                              环境
                            </Label>
                            <Controller
                              name="environment"
                              control={form.control}
                              render={({ field }) => (
                                <div className="relative">
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger
                                      id="project-environment"
                                      className={cn(
                                        "cursor-pointer pl-2.5",
                                        environmentColorMap[field.value],
                                      )}
                                    >
                                      {/* <div className={cn("absolute left-3 size-2 rounded-full opacity-60",
                                          field.value === 'Dev' ? 'bg-blue-500' :
                                          field.value === 'Test' ? 'bg-orange-500' : 'bg-red-500'
                                       )} /> */}
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
                                </div>
                              )}
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5 relative">
                          <Label
                            htmlFor="project-description"
                            className="text-xs text-muted-foreground"
                          >
                            描述
                          </Label>
                          <Textarea
                            id="project-description"
                            rows={3}
                            maxLength={200}
                            placeholder="简要描述项目目标、业务边界和预期协作方式..."
                            className="cursor-text resize-none"
                            {...form.register("description")}
                          />
                          <span
                            className={cn(
                              "absolute right-2 bottom-2 text-[10px] pointer-events-none text-muted-foreground",
                              description.length > 200 && "text-destructive",
                            )}
                          >
                            {description.length}/200
                          </span>
                        </div>

                        {environment === "Prod" && (
                          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                            <div className="flex items-center gap-1.5 font-medium mb-0.5">
                              <AlertTriangle className="size-3.5" />
                              <span>Prod 环境警示</span>
                            </div>
                            <p className="opacity-90 pl-5">
                              Prod 项目启用严格策略：操作需二次确认，部署需审批，配额受限。
                            </p>
                          </div>
                        )}

                        <ProjectQuotaStrategyField
                          quotaPolicyMode={quotaPolicyMode}
                          onQuotaPolicyModeChange={(mode) => {
                            form.setValue("quotaPolicyMode", mode, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            })
                          }}
                          quotaPolicyJsonField={form.register("quotaPolicyJson")}
                          quotaPolicyJsonErrorMessage={
                            form.formState.errors.quotaPolicyJson?.message
                          }
                          shouldAnimate={shouldAnimate}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step-2"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute inset-0 overflow-y-auto px-8 py-6"
                    >
                      <ProjectMemberManager
                        candidates={memberCandidates}
                        value={selectedMembers}
                        onChange={setSelectedMembers}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 border-t border-border/50 bg-background/90 px-8 py-5 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                {/* Footer Info / Skip Link */}
                <div>
                  {step === 2 && (
                    <Button
                      type="submit"
                      variant="link"
                      className="h-auto p-0 text-muted-foreground hover:text-primary"
                    >
                      跳过此步，稍后再说
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {step === 1 ? (
                    <Button asChild variant="outline" className="cursor-pointer">
                      <motion.button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        取消
                      </motion.button>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="cursor-pointer">
                      <motion.button
                        type="button"
                        onClick={handlePrevStep}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        上一步
                      </motion.button>
                    </Button>
                  )}

                  {step === 1 ? (
                    <Button
                      disabled={!canCreateProject}
                      className="min-w-24 cursor-pointer"
                      type="button"
                      onClick={() => void handleNextStep()}
                    >
                      下一步
                      <ArrowRight className="ml-1 size-3.5" />
                    </Button>
                  ) : (
                    <Button
                      asChild
                      disabled={!canCreateProject || submitting}
                      className="min-w-32 cursor-pointer"
                    >
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {submitting ? (
                          <LoaderCircle className="size-4 animate-spin" aria-hidden />
                        ) : null}
                        完成并创建
                      </motion.button>
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
