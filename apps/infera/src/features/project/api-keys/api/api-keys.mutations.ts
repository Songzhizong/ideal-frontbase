import { z } from "zod"
import type {
  CreateApiKeyInput,
  CreateApiKeyResult,
  ProjectApiKeyDetail,
  RevokeApiKeyInput,
  RotateApiKeyInput,
  RotateApiKeyResult,
} from "../types"
import { buildApiKeyUsageSeries, buildApiKeyUsageTopServices } from "./api-keys.seed"
import {
  appendApiKeyAudit,
  cloneApiKeyDetail,
  ensureApiKeysStore,
  generateApiKeyId,
  generateApiSecret,
  synchronizeApiKeyStatuses,
} from "./api-keys.store"

const CreateApiKeyInputSchema = z.object({
  tenantId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(64),
  scopes: z.array(z.enum(["inference:invoke", "metrics:read", "logs:read", "audit:read"])).min(1),
  expiresAt: z.string().datetime().nullable(),
  rpmLimit: z.number().int().positive().nullable(),
  dailyTokenLimit: z.number().int().positive().nullable(),
  note: z.string().trim().max(200),
})

const RotateApiKeyInputSchema = z.object({
  tenantId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  apiKeyId: z.string().trim().min(1),
  revokeOldKey: z.boolean(),
})

const RevokeApiKeyInputSchema = z.object({
  tenantId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  apiKeyId: z.string().trim().min(1),
  confirmText: z.string().trim().min(1),
})

function createDetailFromInput(input: CreateApiKeyInput): ProjectApiKeyDetail {
  const now = new Date().toISOString()
  const usageSeed = Math.floor(Math.random() * 100)

  return {
    apiKeyId: generateApiKeyId(),
    name: input.name.trim(),
    scopes: [...input.scopes],
    rpmLimit: input.rpmLimit,
    dailyTokenLimit: input.dailyTokenLimit,
    expiresAt: input.expiresAt,
    status: "Active",
    lastUsedAt: null,
    createdAt: now,
    updatedAt: now,
    revokedAt: null,
    note: input.note.trim(),
    createdBy: "current.user@mock.ai",
    usage: buildApiKeyUsageSeries(usageSeed),
    usageTopServices: buildApiKeyUsageTopServices(usageSeed),
    audits: [
      {
        auditId: `audit-${Math.random().toString(36).slice(2, 10)}`,
        action: "project.api_key.create",
        actor: "current.user@mock.ai",
        happenedAt: now,
      },
    ],
  }
}

export async function createProjectApiKey(input: CreateApiKeyInput): Promise<CreateApiKeyResult> {
  const payload = CreateApiKeyInputSchema.parse(input)
  const currentStore = ensureApiKeysStore(payload.tenantId, payload.projectId)

  if (currentStore.keys.some((item) => item.name === payload.name.trim())) {
    throw new Error("API Key 名称已存在，请更换后重试")
  }

  const apiKey = createDetailFromInput(payload)
  currentStore.keys.unshift(apiKey)
  synchronizeApiKeyStatuses(currentStore)

  return {
    apiKey: cloneApiKeyDetail(apiKey),
    secret: generateApiSecret(),
  }
}

export async function rotateProjectApiKey(input: RotateApiKeyInput): Promise<RotateApiKeyResult> {
  const payload = RotateApiKeyInputSchema.parse(input)
  const currentStore = ensureApiKeysStore(payload.tenantId, payload.projectId)
  synchronizeApiKeyStatuses(currentStore)

  const previousKey = currentStore.keys.find((item) => item.apiKeyId === payload.apiKeyId)
  if (!previousKey) {
    throw new Error("API Key 不存在")
  }

  const now = new Date().toISOString()

  if (payload.revokeOldKey) {
    previousKey.revokedAt = now
    previousKey.updatedAt = now
    previousKey.status = "Revoked"
    appendApiKeyAudit(previousKey, "project.api_key.rotate.revoke_old")
  } else {
    appendApiKeyAudit(previousKey, "project.api_key.rotate.keep_old")
  }

  const newKey: ProjectApiKeyDetail = {
    ...cloneApiKeyDetail(previousKey),
    apiKeyId: generateApiKeyId(),
    name: `${previousKey.name}-rotated-${now.slice(11, 16).replace(":", "")}`,
    status: "Active",
    revokedAt: null,
    createdAt: now,
    updatedAt: now,
    lastUsedAt: null,
    usage: buildApiKeyUsageSeries(Math.floor(Math.random() * 100)),
    usageTopServices: buildApiKeyUsageTopServices(Math.floor(Math.random() * 100)),
    audits: [
      {
        auditId: `audit-${Math.random().toString(36).slice(2, 10)}`,
        action: "project.api_key.rotate.create_new",
        actor: "current.user@mock.ai",
        happenedAt: now,
      },
    ],
  }

  currentStore.keys.unshift(newKey)
  synchronizeApiKeyStatuses(currentStore)

  return {
    newApiKey: cloneApiKeyDetail(newKey),
    secret: generateApiSecret(),
  }
}

export async function revokeProjectApiKey(input: RevokeApiKeyInput) {
  const payload = RevokeApiKeyInputSchema.parse(input)
  const currentStore = ensureApiKeysStore(payload.tenantId, payload.projectId)
  const target = currentStore.keys.find((item) => item.apiKeyId === payload.apiKeyId)

  if (!target) {
    throw new Error("API Key 不存在")
  }

  const expectedTexts = [target.name, "REVOKE"]
  if (!expectedTexts.includes(payload.confirmText.trim())) {
    throw new Error(`请输入 ${target.name} 或 REVOKE 以确认吊销`)
  }

  target.revokedAt = new Date().toISOString()
  target.updatedAt = target.revokedAt
  target.status = "Revoked"
  appendApiKeyAudit(target, "project.api_key.revoke")
  synchronizeApiKeyStatuses(currentStore)

  return cloneApiKeyDetail(target)
}
