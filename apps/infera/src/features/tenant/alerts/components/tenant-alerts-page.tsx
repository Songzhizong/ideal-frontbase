import { useState } from "react"
import { toast } from "sonner"
import { getHttpErrorMessage } from "@/features/core/api"
import { isApiError } from "@/packages/error-core"
import { ContentLayout } from "@/packages/layout-core"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs"
import { useTenantAlertActions } from "../hooks"
import type { UpsertTenantAlertRulePayload } from "../types/tenant-alerts"
import { TenantActiveAlertsTab } from "./tenant-active-alerts-tab"
import { TenantAlertHistoryTab } from "./tenant-alert-history-tab"
import { TenantAlertRulesTab } from "./tenant-alert-rules-tab"

interface TenantAlertsPageProps {
  tenantId: string
}

const TAB_VALUES = ["active", "rules", "history"] as const

type AlertsTabValue = (typeof TAB_VALUES)[number]

function toErrorMessage(error: unknown) {
  if (isApiError(error)) {
    return getHttpErrorMessage(error)
  }

  if (error instanceof Error) {
    return error.message
  }

  return "操作失败，请稍后重试。"
}

export function TenantAlertsPage({ tenantId }: TenantAlertsPageProps) {
  const [activeTab, setActiveTab] = useState<AlertsTabValue>("active")
  const actions = useTenantAlertActions(tenantId)

  const handleAckAlert = async (alertId: string) => {
    try {
      await actions.ackAlert.mutateAsync({
        tenantId,
        alertId,
      })
    } catch (error) {
      toast.error(toErrorMessage(error))
    }
  }

  const handleCreateRule = async (payload: UpsertTenantAlertRulePayload) => {
    try {
      await actions.createRule.mutateAsync({
        tenantId,
        payload,
      })
    } catch (error) {
      toast.error(toErrorMessage(error))
      throw error
    }
  }

  const handleUpdateRule = async (ruleId: string, payload: UpsertTenantAlertRulePayload) => {
    try {
      await actions.updateRule.mutateAsync({
        tenantId,
        ruleId,
        payload,
      })
    } catch (error) {
      toast.error(toErrorMessage(error))
      throw error
    }
  }

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      await actions.toggleRule.mutateAsync({
        tenantId,
        ruleId,
        enabled,
      })
    } catch (error) {
      toast.error(toErrorMessage(error))
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await actions.deleteRule.mutateAsync({
        tenantId,
        ruleId,
      })
    } catch (error) {
      toast.error(toErrorMessage(error))
    }
  }

  return (
    <ContentLayout
      title="告警中心"
      description="聚合查看当前告警、规则配置与处理历史，快速定位风险并闭环处理。"
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (TAB_VALUES.includes(value as AlertsTabValue)) {
            setActiveTab(value as AlertsTabValue)
          }
        }}
        className="space-y-4"
      >
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="active" className="cursor-pointer px-4">
            Active Alerts
          </TabsTrigger>
          <TabsTrigger value="rules" className="cursor-pointer px-4">
            Alert Rules
          </TabsTrigger>
          <TabsTrigger value="history" className="cursor-pointer px-4">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 border-none p-0 outline-none">
          <TenantActiveAlertsTab
            tenantId={tenantId}
            onAckAlert={handleAckAlert}
            ackLoading={actions.ackAlert.isPending}
          />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4 border-none p-0 outline-none">
          <TenantAlertRulesTab
            tenantId={tenantId}
            onCreateRule={handleCreateRule}
            onUpdateRule={handleUpdateRule}
            onToggleRule={handleToggleRule}
            onDeleteRule={handleDeleteRule}
            updating={actions.createRule.isPending || actions.updateRule.isPending}
            toggling={actions.toggleRule.isPending}
            deleting={actions.deleteRule.isPending}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4 border-none p-0 outline-none">
          <TenantAlertHistoryTab tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  )
}
