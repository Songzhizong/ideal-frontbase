import { Check, CheckCircle2, ChevronRight, Code2 } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import type { UseFormRegisterReturn } from "react-hook-form"
import { Button } from "@/packages/ui/button"
import { Label } from "@/packages/ui/label"
import { Textarea } from "@/packages/ui/textarea"
import { cn } from "@/packages/ui-utils"

interface ProjectQuotaStrategyFieldProps {
  quotaPolicyMode: "tenant_default" | "custom"
  onQuotaPolicyModeChange: (mode: "tenant_default" | "custom") => void
  quotaPolicyJsonField: UseFormRegisterReturn
  quotaPolicyJsonErrorMessage: string | undefined
  shouldAnimate: boolean
}

const QUOTA_STRATEGY_OPTIONS: ReadonlyArray<{
  value: "tenant_default" | "custom"
  title: string
  description: string
}> = [
  {
    value: "tenant_default",
    title: "继承租户策略",
    description: "使用租户已有配额与预算配置，适合大多数项目快速启动。",
  },
  {
    value: "custom",
    title: "自定义高级策略",
    description: "为关键项目提供专属限制规则，支持精细化 JSON 配置。",
  },
]

export function ProjectQuotaStrategyField({
  quotaPolicyMode,
  onQuotaPolicyModeChange,
  quotaPolicyJsonField,
  quotaPolicyJsonErrorMessage,
  shouldAnimate,
}: ProjectQuotaStrategyFieldProps) {
  const [isJsonExpanded, setIsJsonExpanded] = useState(false)

  const strategyCardMotionProps = shouldAnimate
    ? {
        whileHover: { scale: 1.01 },
        whileTap: { scale: 0.995 },
      }
    : {}
  const customQuotaMotionProps = shouldAnimate
    ? {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: "auto" as const },
        exit: { opacity: 0, height: 0 },
      }
    : {}

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>配额策略</Label>
        <p className="text-xs text-muted-foreground">选择最适合当前项目阶段的资源控制方案</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {QUOTA_STRATEGY_OPTIONS.map((option) => {
          const active = quotaPolicyMode === option.value

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onQuotaPolicyModeChange(option.value)}
              {...strategyCardMotionProps}
              className={cn(
                "relative cursor-pointer rounded-xl border p-4 text-left transition-all duration-200",
                active
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/60 bg-card hover:border-border hover:bg-accent/40",
              )}
            >
              {active && (
                <div className="absolute top-0 right-0 rounded-bl-xl rounded-tr-xl bg-primary px-1.5 py-1">
                  <Check className="size-3.5 text-primary-foreground" strokeWidth={3} />
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{option.title}</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {option.description}
              </p>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence initial={false}>
        {quotaPolicyMode === "custom" ? (
          <motion.div
            key="custom-quota-json"
            {...customQuotaMotionProps}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <Code2 className="size-4 text-muted-foreground" />
                  <span>策略配置 JSON</span>
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setIsJsonExpanded(!isJsonExpanded)}
                  className="h-auto p-0 text-xs text-primary decoration-primary/30 hover:decoration-primary"
                >
                  {isJsonExpanded ? "收起配置" : "查看/编辑配置"}
                  <ChevronRight
                    className={cn(
                      "ml-0.5 size-3.5 transition-transform",
                      isJsonExpanded ? "rotate-90" : "",
                    )}
                  />
                </Button>
              </div>

              {isJsonExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 space-y-2"
                >
                  <Textarea
                    id="project-quota-policy"
                    rows={6}
                    placeholder='例如：{"dailyTokenLimit": 2000000, "maxServices": 10}'
                    className="resize-y font-mono text-xs leading-relaxed"
                    {...quotaPolicyJsonField}
                  />
                  {quotaPolicyJsonErrorMessage ? (
                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                      <CheckCircle2 className="size-3.5" />
                      {quotaPolicyJsonErrorMessage}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      请确保输入合法的 JSON 格式。保存后将覆盖默认租户策略。
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
