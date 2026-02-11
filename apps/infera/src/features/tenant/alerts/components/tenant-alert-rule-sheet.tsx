import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { AppSheetContent } from "@/packages/ui/app-sheet"
import { Button } from "@/packages/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/packages/ui/form"
import { Input } from "@/packages/ui/input"
import { ScrollArea } from "@/packages/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Separator } from "@/packages/ui/separator"
import { Sheet, SheetDescription, SheetHeader, SheetTitle } from "@/packages/ui/sheet"
import type {
  TenantAlertRuleItem,
  TenantAlertServiceOption,
  UpsertTenantAlertRulePayload,
} from "../types/tenant-alerts"
import { TENANT_ALERT_TYPES } from "../types/tenant-alerts"
import { formatAlertType } from "../utils/tenant-alerts-formatters"
import { TenantAlertRuleConditionSection } from "./tenant-alert-rule-condition-section"
import {
  getDefaultRuleFormValues,
  getMetricOptions,
  RuleFormSchema,
  type RuleFormValues,
} from "./tenant-alert-rule-form-model"
import { TenantAlertRuleNotificationSection } from "./tenant-alert-rule-notification-section"
import { TenantAlertRuleScopeSection } from "./tenant-alert-rule-scope-section"

interface TenantAlertRuleSheetProps {
  open: boolean
  editingRule: TenantAlertRuleItem | null
  projectOptions: ReadonlyArray<{
    projectId: string
    projectName: string
  }>
  serviceOptions: ReadonlyArray<TenantAlertServiceOption>
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: UpsertTenantAlertRulePayload) => Promise<void>
}

export function TenantAlertRuleSheet({
  open,
  editingRule,
  projectOptions,
  serviceOptions,
  submitting,
  onOpenChange,
  onSubmit,
}: TenantAlertRuleSheetProps) {
  const form = useForm<RuleFormValues>({
    resolver: zodResolver(RuleFormSchema),
    defaultValues: getDefaultRuleFormValues(editingRule),
  })

  const selectedType = form.watch("type")
  const selectedScopeMode = form.watch("scopeMode")
  const selectedProjectIds = form.watch("projectIds")
  const selectedChannels = form.watch("channels")
  const selectedMetricValue = form.watch("metric")

  const metricOptions = useMemo(() => getMetricOptions(selectedType), [selectedType])

  const selectedMetric = useMemo(() => {
    return metricOptions.find((option) => option.value === selectedMetricValue) ?? metricOptions[0]
  }, [metricOptions, selectedMetricValue])

  const availableServices = useMemo(() => {
    if (selectedProjectIds.length === 0) {
      return [] as TenantAlertServiceOption[]
    }

    return serviceOptions.filter((service) => selectedProjectIds.includes(service.projectId))
  }, [selectedProjectIds, serviceOptions])

  useEffect(() => {
    if (open) {
      form.reset(getDefaultRuleFormValues(editingRule))
    }
  }, [editingRule, form, open])

  useEffect(() => {
    const currentMetric = form.getValues("metric")
    const hasMetric = metricOptions.some((option) => option.value === currentMetric)
    if (!hasMetric) {
      form.setValue("metric", metricOptions[0]?.value ?? "", { shouldValidate: true })
    }

    if (selectedType !== "cost") {
      form.setValue("overageAction", null, { shouldValidate: false })
    }
  }, [form, metricOptions, selectedType])

  useEffect(() => {
    if (selectedScopeMode === "all_tenant") {
      form.setValue("projectIds", [], { shouldValidate: false })
      form.setValue("serviceIds", [], { shouldValidate: false })
      return
    }

    if (selectedScopeMode === "projects") {
      form.setValue("serviceIds", [], { shouldValidate: false })
    }
  }, [form, selectedScopeMode])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent side="right" className="w-[720px] max-w-[95vw] p-0 sm:max-w-[720px]">
        <SheetHeader className="border-b border-border/50">
          <SheetTitle>{editingRule ? "编辑告警规则" : "创建告警规则"}</SheetTitle>
          <SheetDescription>
            配置规则类型、作用范围、触发条件与通知渠道。提交后将立即按新规则生效。
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            className="flex h-full flex-col"
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({
                name: values.name,
                type: values.type,
                scopeMode: values.scopeMode,
                projectIds: values.projectIds,
                serviceIds: values.serviceIds,
                condition: {
                  metric: values.metric,
                  operator: values.operator,
                  threshold: values.threshold,
                  unit: selectedMetric?.unit ?? "count",
                  durationMinutes: values.durationMinutes,
                },
                channels: values.channels,
                webhookUrl: values.channels.includes("Webhook") ? values.webhookUrl || null : null,
                overageAction: values.type === "cost" ? values.overageAction : null,
                enabled: values.enabled,
              })
            })}
          >
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-6 px-6 py-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>规则名</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：线上服务 5xx 告警" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>规则类型</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder="选择规则类型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TENANT_ALERT_TYPES.map((type) => (
                              <SelectItem key={type} value={type} className="cursor-pointer">
                                {formatAlertType(type)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scopeMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>作用范围</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder="选择作用范围" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all_tenant" className="cursor-pointer">
                              全租户
                            </SelectItem>
                            <SelectItem value="projects" className="cursor-pointer">
                              指定项目
                            </SelectItem>
                            <SelectItem value="services" className="cursor-pointer">
                              指定服务
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <TenantAlertRuleScopeSection
                  form={form}
                  scopeMode={selectedScopeMode}
                  projectOptions={projectOptions}
                  availableServices={availableServices}
                />

                <Separator className="bg-border/50" />

                <TenantAlertRuleConditionSection
                  form={form}
                  selectedType={selectedType}
                  metricOptions={metricOptions}
                  selectedMetric={selectedMetric}
                />

                <Separator className="bg-border/50" />

                <TenantAlertRuleNotificationSection
                  form={form}
                  selectedChannels={selectedChannels}
                />
              </div>
            </ScrollArea>

            <div className="flex items-center justify-end gap-2 border-t border-border/50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={submitting}>
                {editingRule ? "保存变更" : "创建规则"}
              </Button>
            </div>
          </form>
        </Form>
      </AppSheetContent>
    </Sheet>
  )
}
