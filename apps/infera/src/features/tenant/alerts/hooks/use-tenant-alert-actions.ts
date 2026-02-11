import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  ackTenantAlert,
  createTenantAlertRule,
  deleteTenantAlertRule,
  toggleTenantAlertRule,
  updateTenantAlertRule,
} from "../api"
import type {
  AckTenantAlertInput,
  CreateTenantAlertRuleInput,
  DeleteTenantAlertRuleInput,
  ToggleTenantAlertRuleInput,
  UpdateTenantAlertRuleInput,
} from "../types/tenant-alerts"

function invalidateAlertsQueries(queryClient: ReturnType<typeof useQueryClient>, tenantId: string) {
  void queryClient.invalidateQueries({
    queryKey: ["infera", "tenant", "alerts", tenantId, "active"],
  })
  void queryClient.invalidateQueries({
    queryKey: ["infera", "tenant", "alerts", tenantId, "rules"],
  })
  void queryClient.invalidateQueries({
    queryKey: ["infera", "tenant", "alerts", tenantId, "history"],
  })
}

export function useTenantAlertActions(tenantId: string) {
  const queryClient = useQueryClient()

  const ackAlert = useMutation({
    mutationFn: (input: AckTenantAlertInput) => ackTenantAlert(input),
    onSuccess: () => {
      toast.success("告警已确认")
      invalidateAlertsQueries(queryClient, tenantId)
    },
  })

  const createRule = useMutation({
    mutationFn: (input: CreateTenantAlertRuleInput) => createTenantAlertRule(input),
    onSuccess: () => {
      toast.success("告警规则已创建")
      invalidateAlertsQueries(queryClient, tenantId)
    },
  })

  const updateRule = useMutation({
    mutationFn: (input: UpdateTenantAlertRuleInput) => updateTenantAlertRule(input),
    onSuccess: () => {
      toast.success("告警规则已更新")
      invalidateAlertsQueries(queryClient, tenantId)
    },
  })

  const toggleRule = useMutation({
    mutationFn: (input: ToggleTenantAlertRuleInput) => toggleTenantAlertRule(input),
    onSuccess: (_data, variables) => {
      toast.success(variables.enabled ? "告警规则已启用" : "告警规则已禁用")
      invalidateAlertsQueries(queryClient, tenantId)
    },
  })

  const deleteRule = useMutation({
    mutationFn: (input: DeleteTenantAlertRuleInput) => deleteTenantAlertRule(input),
    onSuccess: () => {
      toast.success("告警规则已删除")
      invalidateAlertsQueries(queryClient, tenantId)
    },
  })

  return {
    ackAlert,
    createRule,
    updateRule,
    toggleRule,
    deleteRule,
  }
}
