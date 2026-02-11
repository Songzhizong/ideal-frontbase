import type {
  TenantAuditActorType,
  TenantAuditLogDetail,
  TenantAuditProjectOption,
} from "../types/tenant-audit"

export interface TenantAuditSeed {
  projectOptions: TenantAuditProjectOption[]
  logs: TenantAuditLogDetail[]
}

interface ActorSeed {
  type: TenantAuditActorType
  name: string | null
  email: string
  ip: string
  userAgent: string
}

interface ActionSeed {
  action: string
  resourceType: string
  resourcePrefix: string
}

const TENANT_PROJECT_OPTIONS: Record<string, TenantAuditProjectOption[]> = {
  "1": [
    { projectId: "proj-infera-chat", projectName: "Infera Chat" },
    { projectId: "proj-infera-eval", projectName: "Infera Eval" },
    { projectId: "proj-infera-runtime", projectName: "Infera Runtime" },
  ],
  "2": [
    { projectId: "proj-data-lab", projectName: "Data Lab" },
    { projectId: "proj-agent-tools", projectName: "Agent Tools" },
  ],
}

const ACTOR_SEEDS: readonly ActorSeed[] = [
  {
    type: "user",
    name: "张松",
    email: "zhangsong@infera.ai",
    ip: "10.21.3.11",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6_0) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36",
  },
  {
    type: "user",
    name: "王雨",
    email: "wangyu@infera.ai",
    ip: "10.21.3.22",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/129.0.0.0 Safari/537.36",
  },
  {
    type: "service_account",
    name: "自动化机器人",
    email: "svc-audit-bot@infera.ai",
    ip: "172.31.12.9",
    userAgent: "infera-audit-bot/1.4.2",
  },
  {
    type: "service_account",
    name: "计费同步器",
    email: "svc-billing-sync@infera.ai",
    ip: "172.31.10.7",
    userAgent: "infera-billing-sync/2.1.0",
  },
]

const ACTION_SEEDS: readonly ActionSeed[] = [
  { action: "tenant.quota.update", resourceType: "quota_policy", resourcePrefix: "quota" },
  { action: "tenant.budget.update", resourceType: "budget_policy", resourcePrefix: "budget" },
  { action: "project.create", resourceType: "project", resourcePrefix: "project" },
  { action: "project.delete", resourceType: "project", resourcePrefix: "project" },
  { action: "user.invite.create", resourceType: "invitation", resourcePrefix: "invitation" },
  { action: "user.role.update", resourceType: "tenant_user", resourcePrefix: "user" },
  { action: "alert.rule.update", resourceType: "alert_rule", resourcePrefix: "rule" },
  { action: "billing.invoice.export", resourceType: "invoice", resourcePrefix: "invoice" },
]

function toBeforePayload(action: string, resourceId: string, projectId: string | null) {
  if (action.endsWith(".create")) {
    return null
  }

  if (action.endsWith(".delete")) {
    return {
      resourceId,
      projectId,
      state: "existing",
      limits: {
        rpm: 1200,
        gpuQuota: 8,
      },
    }
  }

  return {
    resourceId,
    projectId,
    state: "before",
    limits: {
      rpm: 1200,
      gpuQuota: 8,
    },
  }
}

function toAfterPayload(action: string, resourceId: string, projectId: string | null) {
  if (action.endsWith(".delete")) {
    return null
  }

  if (action.endsWith(".create")) {
    return {
      resourceId,
      projectId,
      state: "created",
      limits: {
        rpm: 2000,
        gpuQuota: 12,
      },
    }
  }

  return {
    resourceId,
    projectId,
    state: "after",
    limits: {
      rpm: 1800,
      gpuQuota: 10,
    },
  }
}

function createLogs(
  tenantId: string,
  projectOptions: TenantAuditProjectOption[],
): TenantAuditLogDetail[] {
  const now = Date.now()

  return Array.from({ length: 56 }).map((_, index) => {
    const actor = ACTOR_SEEDS[index % ACTOR_SEEDS.length]
    const actionSeed = ACTION_SEEDS[index % ACTION_SEEDS.length]

    if (!actor || !actionSeed) {
      throw new Error("Missing actor or action seed.")
    }

    const project =
      actionSeed.resourceType === "quota_policy" ||
      actionSeed.resourceType === "budget_policy" ||
      actionSeed.resourceType === "invoice"
        ? null
        : (projectOptions[index % projectOptions.length] ?? null)
    const happenedAtMs = now - index * 45 * 60 * 1000
    const resourceId = `${actionSeed.resourcePrefix}-${tenantId}-${1000 + index}`

    return {
      logId: `audit-${tenantId}-${1000 + index}`,
      happenedAtMs,
      actorType: actor.type,
      actorName: actor.name,
      actorEmail: actor.email,
      action: actionSeed.action,
      resourceType: actionSeed.resourceType,
      resourceId,
      resourceName: `${actionSeed.resourceType}-${1000 + index}`,
      projectId: project?.projectId ?? null,
      projectName: project?.projectName ?? null,
      ip: actor.ip,
      userAgent: actor.userAgent,
      beforePayload: toBeforePayload(actionSeed.action, resourceId, project?.projectId ?? null),
      afterPayload: toAfterPayload(actionSeed.action, resourceId, project?.projectId ?? null),
    }
  })
}

function createTenantSeed(tenantId: string): TenantAuditSeed {
  const projectOptions = TENANT_PROJECT_OPTIONS[tenantId] ?? TENANT_PROJECT_OPTIONS["1"] ?? []

  if (projectOptions.length === 0) {
    throw new Error("Missing tenant audit project options.")
  }

  return {
    projectOptions,
    logs: createLogs(tenantId, projectOptions),
  }
}

export const TENANT_AUDIT_SEEDS: Record<string, TenantAuditSeed> = {
  "1": createTenantSeed("1"),
  "2": createTenantSeed("2"),
}
