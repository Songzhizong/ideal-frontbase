import type { UseFormReturn } from "react-hook-form"
import { Checkbox } from "@/packages/ui/checkbox"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/packages/ui/form"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Switch } from "@/packages/ui/switch"
import { TENANT_ALERT_CHANNELS, type TenantAlertChannel } from "../types/tenant-alerts"
import { type RuleFormValues, toggleListValue } from "./tenant-alert-rule-form-model"

interface TenantAlertRuleNotificationSectionProps {
  form: UseFormReturn<RuleFormValues>
  selectedChannels: readonly TenantAlertChannel[]
}

export function TenantAlertRuleNotificationSection({
  form,
  selectedChannels,
}: TenantAlertRuleNotificationSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="channels"
        render={({ field }) => (
          <FormItem>
            <FormLabel>通知渠道</FormLabel>
            <div className="grid gap-2 rounded-lg border border-border/50 bg-card p-3">
              {TENANT_ALERT_CHANNELS.map((channel) => {
                const checked = field.value.includes(channel)
                return (
                  <Label
                    key={channel}
                    className="flex cursor-pointer items-center gap-2 font-normal"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(nextChecked) => {
                        const nextValues = toggleListValue(
                          field.value,
                          channel,
                          nextChecked === true,
                        ) as TenantAlertChannel[]
                        field.onChange(nextValues)
                      }}
                    />
                    <span>{channel}</span>
                  </Label>
                )
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedChannels.includes("Webhook") ? (
        <FormField
          control={form.control}
          name="webhookUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Webhook URL</FormLabel>
              <FormControl>
                <Input placeholder="https://hooks.example.com/alerts" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      <FormField
        control={form.control}
        name="enabled"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-3 py-2">
              <div>
                <FormLabel>启用规则</FormLabel>
                <p className="text-xs text-muted-foreground">
                  关闭后仅保留规则定义，不再触发新告警。
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </div>
          </FormItem>
        )}
      />
    </>
  )
}
