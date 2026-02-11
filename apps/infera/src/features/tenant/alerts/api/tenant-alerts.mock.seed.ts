import type {
  TenantActiveAlertItem,
  TenantAlertHistoryItem,
  TenantAlertProjectOption,
  TenantAlertRuleItem,
  TenantAlertServiceOption,
} from "../types/tenant-alerts"

export interface TenantAlertsSeed {
  activeAlerts: TenantActiveAlertItem[]
  rules: TenantAlertRuleItem[]
  history: TenantAlertHistoryItem[]
  projectOptions: TenantAlertProjectOption[]
  serviceOptions: TenantAlertServiceOption[]
}

const tenant1Projects: TenantAlertProjectOption[] = [
  {
    projectId: "project-chat",
    projectName: "Chat Gateway",
  },
  {
    projectId: "project-rag",
    projectName: "RAG Platform",
  },
]

const tenant1Services: TenantAlertServiceOption[] = [
  {
    serviceId: "svc-chat-online",
    serviceName: "chat-online",
    projectId: "project-chat",
  },
  {
    serviceId: "svc-chat-batch",
    serviceName: "chat-batch",
    projectId: "project-chat",
  },
  {
    serviceId: "svc-rag-query",
    serviceName: "rag-query",
    projectId: "project-rag",
  },
]

const tenant2Projects: TenantAlertProjectOption[] = [
  {
    projectId: "project-vision",
    projectName: "Vision Stack",
  },
  {
    projectId: "project-eval",
    projectName: "Evaluation Hub",
  },
]

const tenant2Services: TenantAlertServiceOption[] = [
  {
    serviceId: "svc-vision-detect",
    serviceName: "vision-detect",
    projectId: "project-vision",
  },
  {
    serviceId: "svc-eval-report",
    serviceName: "eval-report",
    projectId: "project-eval",
  },
]

export const TENANT_ALERTS_SEEDS: Readonly<Record<string, TenantAlertsSeed>> = {
  "1": {
    activeAlerts: [
      {
        alertId: "alt-1001",
        severity: "S1",
        type: "error_rate",
        scopeType: "service",
        scopeName: "chat-online",
        projectId: "project-chat",
        serviceId: "svc-chat-online",
        triggeredAt: "2026-02-10T09:20:00Z",
        currentValue: 8.2,
        thresholdValue: 5,
        unit: "%",
        status: "Open",
        summary: "5xx 错误率连续 10 分钟超过 5%",
      },
      {
        alertId: "alt-1002",
        severity: "S2",
        type: "latency",
        scopeType: "service",
        scopeName: "rag-query",
        projectId: "project-rag",
        serviceId: "svc-rag-query",
        triggeredAt: "2026-02-10T08:10:00Z",
        currentValue: 1320,
        thresholdValue: 900,
        unit: "ms",
        status: "Ack",
        summary: "P95 延迟升高，建议检查上游依赖与缓存命中率。",
      },
      {
        alertId: "alt-1003",
        severity: "S3",
        type: "cost",
        scopeType: "tenant",
        scopeName: "Acme AI",
        projectId: null,
        serviceId: null,
        triggeredAt: "2026-02-09T22:40:00Z",
        currentValue: 21340,
        thresholdValue: 20000,
        unit: "CNY",
        status: "Open",
        summary: "本月成本超过预算阈值 100%。",
      },
    ],
    rules: [
      {
        ruleId: "rule-1",
        name: "线上服务 5xx 告警",
        type: "error_rate",
        scopeMode: "services",
        projectIds: ["project-chat"],
        serviceIds: ["svc-chat-online"],
        scopeLabel: "指定服务 (chat-online)",
        condition: {
          metric: "http_5xx_rate",
          operator: ">",
          threshold: 5,
          unit: "%",
          durationMinutes: 10,
        },
        channels: ["Email", "Webhook"],
        webhookUrl: "https://hooks.example.com/alerts/chat-online",
        overageAction: null,
        enabled: true,
        updatedAt: "2026-02-10T09:00:00Z",
        updatedBy: "wang.admin@acme.ai",
      },
      {
        ruleId: "rule-2",
        name: "租户月成本阈值",
        type: "cost",
        scopeMode: "all_tenant",
        projectIds: [],
        serviceIds: [],
        scopeLabel: "全租户",
        condition: {
          metric: "monthly_cost_cny",
          operator: ">=",
          threshold: 20000,
          unit: "CNY",
          durationMinutes: 5,
        },
        channels: ["Email"],
        webhookUrl: null,
        overageAction: "alert_only",
        enabled: true,
        updatedAt: "2026-02-09T15:30:00Z",
        updatedBy: "li.finance@acme.ai",
      },
      {
        ruleId: "rule-3",
        name: "RAG 服务 P95 延迟",
        type: "latency",
        scopeMode: "projects",
        projectIds: ["project-rag"],
        serviceIds: [],
        scopeLabel: "指定项目 (RAG Platform)",
        condition: {
          metric: "p95_latency_ms",
          operator: ">",
          threshold: 900,
          unit: "ms",
          durationMinutes: 5,
        },
        channels: ["Email"],
        webhookUrl: null,
        overageAction: null,
        enabled: false,
        updatedAt: "2026-02-08T11:20:00Z",
        updatedBy: "zhou.ops@acme.ai",
      },
    ],
    history: [
      {
        historyId: "hist-1001",
        alertId: "alt-1001",
        event: "Triggered",
        type: "error_rate",
        scopeName: "chat-online",
        status: "Open",
        happenedAt: "2026-02-10T09:20:00Z",
        actor: "system",
        detail: "5xx 错误率达到 8.2%，超过阈值 5%。",
      },
      {
        historyId: "hist-1002",
        alertId: "alt-1002",
        event: "Acked",
        type: "latency",
        scopeName: "rag-query",
        status: "Ack",
        happenedAt: "2026-02-10T08:20:00Z",
        actor: "wang.admin@acme.ai",
        detail: "已确认延迟升高，进入排查流程。",
      },
      {
        historyId: "hist-1003",
        alertId: "alt-0901",
        event: "Resolved",
        type: "pending_timeout",
        scopeName: "chat-batch",
        status: "Resolved",
        happenedAt: "2026-02-09T17:12:00Z",
        actor: "system",
        detail: "实例扩容后 Pending 超时恢复正常。",
      },
    ],
    projectOptions: tenant1Projects,
    serviceOptions: tenant1Services,
  },
  "2": {
    activeAlerts: [
      {
        alertId: "alt-2001",
        severity: "S2",
        type: "cold_start",
        scopeType: "service",
        scopeName: "vision-detect",
        projectId: "project-vision",
        serviceId: "svc-vision-detect",
        triggeredAt: "2026-02-10T07:10:00Z",
        currentValue: 12,
        thresholdValue: 8,
        unit: "count",
        status: "Open",
        summary: "冷启动次数在 30 分钟内持续升高。",
      },
    ],
    rules: [
      {
        ruleId: "rule-2001",
        name: "视觉服务冷启动",
        type: "cold_start",
        scopeMode: "services",
        projectIds: ["project-vision"],
        serviceIds: ["svc-vision-detect"],
        scopeLabel: "指定服务 (vision-detect)",
        condition: {
          metric: "cold_start_count",
          operator: ">",
          threshold: 8,
          unit: "count",
          durationMinutes: 30,
        },
        channels: ["Email"],
        webhookUrl: null,
        overageAction: null,
        enabled: true,
        updatedAt: "2026-02-10T06:55:00Z",
        updatedBy: "ops@nebula.ai",
      },
    ],
    history: [
      {
        historyId: "hist-2001",
        alertId: "alt-2001",
        event: "Triggered",
        type: "cold_start",
        scopeName: "vision-detect",
        status: "Open",
        happenedAt: "2026-02-10T07:10:00Z",
        actor: "system",
        detail: "冷启动次数超阈值。",
      },
    ],
    projectOptions: tenant2Projects,
    serviceOptions: tenant2Services,
  },
}
