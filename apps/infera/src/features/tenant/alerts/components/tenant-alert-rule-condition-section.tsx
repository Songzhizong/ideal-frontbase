import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/packages/ui/form"
import { Input } from "@/packages/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import type { MetricOption, RuleFormValues } from "./tenant-alert-rule-form-model"

interface TenantAlertRuleConditionSectionProps {
  form: UseFormReturn<RuleFormValues>
  selectedType: RuleFormValues["type"]
  metricOptions: readonly MetricOption[]
  selectedMetric: MetricOption | undefined
}

export function TenantAlertRuleConditionSection({
  form,
  selectedType,
  metricOptions,
  selectedMetric,
}: TenantAlertRuleConditionSectionProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="metric"
          render={({ field }) => (
            <FormItem>
              <FormLabel>指标</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="选择指标" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {metricOptions.map((metric) => (
                    <SelectItem key={metric.value} value={metric.value} className="cursor-pointer">
                      {metric.label}
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
          name="operator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>比较符</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="选择比较符" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value=">" className="cursor-pointer">
                    大于 ( &gt; )
                  </SelectItem>
                  <SelectItem value=">=" className="cursor-pointer">
                    大于等于 ( &gt;= )
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>阈值 ({selectedMetric?.unit ?? "-"})</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value)
                    field.onChange(Number.isNaN(nextValue) ? 0 : nextValue)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="durationMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>持续时间（分钟）</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value)
                    field.onChange(Number.isNaN(nextValue) ? 0 : nextValue)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {selectedType === "cost" ? (
        <FormField
          control={form.control}
          name="overageAction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>超限动作</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => {
                  if (value === "alert_only" || value === "block_inference") {
                    field.onChange(value)
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="选择超限动作" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="alert_only" className="cursor-pointer">
                    仅告警
                  </SelectItem>
                  <SelectItem value="block_inference" className="cursor-pointer">
                    阻断推理
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
    </>
  )
}
