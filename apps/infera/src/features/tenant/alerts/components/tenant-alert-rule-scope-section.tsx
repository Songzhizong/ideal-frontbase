import type { UseFormReturn } from "react-hook-form"
import { Badge } from "@/packages/ui/badge"
import { Checkbox } from "@/packages/ui/checkbox"
import { FormField, FormItem, FormLabel, FormMessage } from "@/packages/ui/form"
import { Label } from "@/packages/ui/label"
import type { TenantAlertServiceOption } from "../types/tenant-alerts"
import { type RuleFormValues, toggleListValue } from "./tenant-alert-rule-form-model"

interface ProjectOption {
  projectId: string
  projectName: string
}

interface TenantAlertRuleScopeSectionProps {
  form: UseFormReturn<RuleFormValues>
  scopeMode: RuleFormValues["scopeMode"]
  projectOptions: readonly ProjectOption[]
  availableServices: readonly TenantAlertServiceOption[]
}

export function TenantAlertRuleScopeSection({
  form,
  scopeMode,
  projectOptions,
  availableServices,
}: TenantAlertRuleScopeSectionProps) {
  if (scopeMode === "all_tenant") {
    return null
  }

  return (
    <>
      <FormField
        control={form.control}
        name="projectIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>项目选择</FormLabel>
            <div className="grid gap-2 rounded-lg border border-border/50 bg-card p-3">
              {projectOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground">暂无可选项目</p>
              ) : (
                projectOptions.map((project) => {
                  const checked = field.value.includes(project.projectId)
                  return (
                    <Label
                      key={project.projectId}
                      className="flex cursor-pointer items-center gap-2 font-normal"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(nextChecked) => {
                          field.onChange(
                            toggleListValue(field.value, project.projectId, nextChecked === true),
                          )
                        }}
                      />
                      <span>{project.projectName}</span>
                    </Label>
                  )
                })
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {scopeMode === "services" ? (
        <FormField
          control={form.control}
          name="serviceIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>服务选择</FormLabel>
              <div className="grid gap-2 rounded-lg border border-border/50 bg-card p-3">
                {availableServices.length === 0 ? (
                  <p className="text-xs text-muted-foreground">请先选择项目后再选择服务</p>
                ) : (
                  availableServices.map((service) => {
                    const checked = field.value.includes(service.serviceId)
                    const projectName = projectOptions.find(
                      (project) => project.projectId === service.projectId,
                    )?.projectName

                    return (
                      <Label
                        key={service.serviceId}
                        className="flex cursor-pointer items-center gap-2 font-normal"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(nextChecked) => {
                            field.onChange(
                              toggleListValue(field.value, service.serviceId, nextChecked === true),
                            )
                          }}
                        />
                        <span>{service.serviceName}</span>
                        {projectName ? (
                          <Badge variant="outline" className="text-xs">
                            {projectName}
                          </Badge>
                        ) : null}
                      </Label>
                    )
                  })
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
    </>
  )
}
