import { z } from "zod"
import type {
  AddProjectMemberInput,
  CreateServiceAccountInput,
  DeleteProjectInput,
  DeleteServiceAccountInput,
  ProjectMember,
  ProjectRole,
  ProjectSettingsSnapshot,
  RemoveProjectMemberInput,
  RotateServiceAccountTokenInput,
  SaveProjectEnvironmentPoliciesInput,
  SaveProjectQuotaPolicyInput,
  ServiceAccountItem,
  ToggleServiceAccountInput,
  UpdateProjectMemberRoleInput,
  UpdateProjectOverviewInput,
} from "../types/project-settings"

const ProjectRoleSchema = z.enum(["Owner", "Developer", "Viewer"])

const UpdateOverviewSchema = z.object({
  tenantId: z.string().min(1),
  projectId: z.string().min(1),
  projectName: z.string().trim().min(2).max(64),
  environment: z.enum(["Dev", "Test", "Prod"]),
  description: z.string().trim().max(200),
})

const AddMemberSchema = z.object({
  tenantId: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  role: ProjectRoleSchema,
})

const CreateServiceAccountSchema = z.object({
  tenantId: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().trim().min(2).max(64),
  role: ProjectRoleSchema,
  note: z.string().trim().max(120),
})

const SaveQuotaPolicySchema = z.object({
  tenantId: z.string().min(1),
  projectId: z.string().min(1),
  policy: z.object({
    inheritTenantPolicy: z.boolean(),
    dailyTokenLimit: z.number().int().nonnegative(),
    monthlyTokenLimit: z.number().int().nonnegative(),
    monthlyBudgetCny: z.number().nonnegative(),
    alertThresholds: z.array(z.number().min(1).max(100)).min(1),
    overLimitAction: z.enum(["Block", "Throttle"]),
    notificationChannels: z.array(z.string().min(1)).min(1),
  }),
})

const SaveEnvPoliciesSchema = z.object({
  tenantId: z.string().min(1),
  projectId: z.string().min(1),
  policies: z.object({
    disableScaleToZeroInProd: z.boolean(),
    requireAlertsInProd: z.boolean(),
    disablePlaygroundLoggingInProd: z.boolean(),
    forbidViewerLogs: z.boolean(),
  }),
})

function getStoreKey(tenantId: string, projectId: string) {
  return `${tenantId}:${projectId}`
}

function formatNowIso() {
  return new Date().toISOString()
}

function createSeed(tenantId: string, projectId: string): ProjectSettingsSnapshot {
  return {
    overview: {
      projectId,
      projectName: projectId === "project-chat" ? "Chat Gateway" : "Vision Stack",
      environment: projectId.includes("prod") || projectId.includes("chat") ? "Prod" : "Dev",
      description: "用于承载模型、推理服务和评估任务的核心项目。",
      createdAt: "2026-01-21T08:12:00Z",
      createdBy: tenantId === "1" ? "owner@acme.ai" : "owner@nebula.ai",
    },
    members: [
      {
        memberId: "mem-owner-1",
        name: "项目所有者",
        email: "owner@mock.ai",
        role: "Owner",
        joinedAt: "2026-01-21T08:12:00Z",
      },
      {
        memberId: "mem-dev-1",
        name: "模型工程师",
        email: "ml.dev@mock.ai",
        role: "Developer",
        joinedAt: "2026-01-24T10:20:00Z",
      },
      {
        memberId: "mem-viewer-1",
        name: "审计观察员",
        email: "audit.viewer@mock.ai",
        role: "Viewer",
        joinedAt: "2026-01-30T13:28:00Z",
      },
    ],
    serviceAccounts: [
      {
        serviceAccountId: "sa-ingest-bot",
        name: "ingest-bot",
        role: "Developer",
        status: "Active",
        lastUsedAt: "2026-02-10T09:36:00Z",
        createdAt: "2026-01-23T02:11:00Z",
        note: "用于离线数据导入任务",
      },
      {
        serviceAccountId: "sa-eval-ci",
        name: "eval-ci",
        role: "Viewer",
        status: "Disabled",
        lastUsedAt: "2026-02-03T16:10:00Z",
        createdAt: "2026-01-29T11:04:00Z",
        note: "仅用于流水线回归评估",
      },
    ],
    quotaBudgetPolicy: {
      inheritTenantPolicy: false,
      dailyTokenLimit: 80000000,
      monthlyTokenLimit: 2200000000,
      monthlyBudgetCny: 38000,
      alertThresholds: [70, 85, 95],
      overLimitAction: "Throttle",
      notificationChannels: ["邮件", "Webhook"],
    },
    environmentPolicies: {
      disableScaleToZeroInProd: true,
      requireAlertsInProd: true,
      disablePlaygroundLoggingInProd: true,
      forbidViewerLogs: true,
    },
  }
}

const projectSettingsStore = new Map<string, ProjectSettingsSnapshot>()

function ensureSnapshot(tenantId: string, projectId: string) {
  const key = getStoreKey(tenantId, projectId)
  const existing = projectSettingsStore.get(key)
  if (existing) {
    return existing
  }

  const seed = createSeed(tenantId, projectId)
  projectSettingsStore.set(key, seed)
  return seed
}

function cloneMember(item: ProjectMember): ProjectMember {
  return { ...item }
}

function cloneServiceAccount(item: ServiceAccountItem): ServiceAccountItem {
  return { ...item }
}

function cloneSnapshot(snapshot: ProjectSettingsSnapshot): ProjectSettingsSnapshot {
  return {
    overview: { ...snapshot.overview },
    members: snapshot.members.map(cloneMember),
    serviceAccounts: snapshot.serviceAccounts.map(cloneServiceAccount),
    quotaBudgetPolicy: {
      ...snapshot.quotaBudgetPolicy,
      alertThresholds: [...snapshot.quotaBudgetPolicy.alertThresholds],
      notificationChannels: [...snapshot.quotaBudgetPolicy.notificationChannels],
    },
    environmentPolicies: { ...snapshot.environmentPolicies },
  }
}

function getMemberRoleCount(members: readonly ProjectMember[], role: ProjectRole) {
  return members.filter((item) => item.role === role).length
}

export async function getProjectSettings(tenantId: string, projectId: string) {
  const snapshot = ensureSnapshot(tenantId, projectId)
  return cloneSnapshot(snapshot)
}

export async function updateProjectOverview(input: UpdateProjectOverviewInput) {
  const payload = UpdateOverviewSchema.parse(input)
  const snapshot = ensureSnapshot(payload.tenantId, payload.projectId)
  snapshot.overview.projectName = payload.projectName
  snapshot.overview.environment = payload.environment
  snapshot.overview.description = payload.description
  return cloneSnapshot(snapshot)
}

export async function addProjectMember(input: AddProjectMemberInput) {
  const payload = AddMemberSchema.parse(input)
  const snapshot = ensureSnapshot(payload.tenantId, payload.projectId)

  const existed = snapshot.members.find((member) => member.email === payload.email)
  if (existed) {
    throw new Error("该成员已存在于项目中")
  }

  snapshot.members.unshift({
    memberId: `mem-${Math.random().toString(36).slice(2, 10)}`,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    joinedAt: formatNowIso(),
  })

  return cloneSnapshot(snapshot)
}

export async function updateProjectMemberRole(input: UpdateProjectMemberRoleInput) {
  const snapshot = ensureSnapshot(input.tenantId, input.projectId)
  const member = snapshot.members.find((item) => item.memberId === input.memberId)
  if (!member) {
    throw new Error("成员不存在")
  }

  if (member.role === "Owner" && input.role !== "Owner") {
    const ownerCount = getMemberRoleCount(snapshot.members, "Owner")
    if (ownerCount <= 1) {
      throw new Error("项目至少需要保留一个 Owner")
    }
  }

  member.role = input.role
  return cloneSnapshot(snapshot)
}

export async function removeProjectMember(input: RemoveProjectMemberInput) {
  const snapshot = ensureSnapshot(input.tenantId, input.projectId)
  const target = snapshot.members.find((item) => item.memberId === input.memberId)
  if (!target) {
    throw new Error("成员不存在")
  }

  if (target.role === "Owner" && getMemberRoleCount(snapshot.members, "Owner") <= 1) {
    throw new Error("最后一个 Owner 不可移除")
  }

  snapshot.members = snapshot.members.filter((item) => item.memberId !== input.memberId)
  return cloneSnapshot(snapshot)
}

export async function createProjectServiceAccount(input: CreateServiceAccountInput) {
  const payload = CreateServiceAccountSchema.parse(input)
  const snapshot = ensureSnapshot(payload.tenantId, payload.projectId)

  snapshot.serviceAccounts.unshift({
    serviceAccountId: `sa-${Math.random().toString(36).slice(2, 10)}`,
    name: payload.name,
    role: payload.role,
    status: "Active",
    lastUsedAt: null,
    createdAt: formatNowIso(),
    note: payload.note,
  })

  return cloneSnapshot(snapshot)
}

export async function rotateProjectServiceAccountToken(input: RotateServiceAccountTokenInput) {
  const snapshot = ensureSnapshot(input.tenantId, input.projectId)
  const account = snapshot.serviceAccounts.find(
    (item) => item.serviceAccountId === input.serviceAccountId,
  )
  if (!account) {
    throw new Error("服务账号不存在")
  }

  if (input.disableOldToken) {
    account.status = "Disabled"
  }

  account.lastUsedAt = formatNowIso()
  return {
    secret: `infera_sk_${Math.random().toString(36).slice(2, 14)}_${Math.random().toString(36).slice(2, 14)}`,
  }
}

export async function toggleProjectServiceAccountStatus(input: ToggleServiceAccountInput) {
  const snapshot = ensureSnapshot(input.tenantId, input.projectId)
  const account = snapshot.serviceAccounts.find(
    (item) => item.serviceAccountId === input.serviceAccountId,
  )
  if (!account) {
    throw new Error("服务账号不存在")
  }

  account.status = input.nextStatus
  return cloneSnapshot(snapshot)
}

export async function deleteProjectServiceAccount(input: DeleteServiceAccountInput) {
  const snapshot = ensureSnapshot(input.tenantId, input.projectId)
  snapshot.serviceAccounts = snapshot.serviceAccounts.filter(
    (item) => item.serviceAccountId !== input.serviceAccountId,
  )
  return cloneSnapshot(snapshot)
}

export async function saveProjectQuotaPolicy(input: SaveProjectQuotaPolicyInput) {
  const payload = SaveQuotaPolicySchema.parse(input)
  const snapshot = ensureSnapshot(payload.tenantId, payload.projectId)
  snapshot.quotaBudgetPolicy = {
    ...payload.policy,
    alertThresholds: [...payload.policy.alertThresholds].sort((a, b) => a - b),
    notificationChannels: [...payload.policy.notificationChannels],
  }
  return cloneSnapshot(snapshot)
}

export async function saveProjectEnvironmentPolicies(input: SaveProjectEnvironmentPoliciesInput) {
  const payload = SaveEnvPoliciesSchema.parse(input)
  const snapshot = ensureSnapshot(payload.tenantId, payload.projectId)
  snapshot.environmentPolicies = { ...payload.policies }
  return cloneSnapshot(snapshot)
}

export async function deleteProject(input: DeleteProjectInput) {
  const key = getStoreKey(input.tenantId, input.projectId)
  projectSettingsStore.delete(key)
}
