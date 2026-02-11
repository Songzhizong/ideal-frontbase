import { z } from "zod"
import { api } from "@/features/core/api"
import {
  type CreateTenantProjectInput,
  type CreateTenantProjectResponse,
  TENANT_PROJECT_ENVIRONMENTS,
  TENANT_PROJECT_ROLES,
} from "../types/tenant-projects"

const CreateTenantProjectInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  name: z
    .string()
    .min(2, "项目名称至少 2 个字符")
    .max(64, "项目名称最多 64 个字符")
    .transform((value) => value.trim()),
  environment: z.enum(TENANT_PROJECT_ENVIRONMENTS),
  description: z
    .string()
    .max(200, "项目描述最多 200 个字符")
    .transform((value) => value.trim())
    .default(""),
  quotaPolicyMode: z.enum(["tenant_default", "custom"]),
  quotaPolicyJson: z.string().nullable(),
  initialMembers: z
    .array(
      z.object({
        userId: z.string().min(1, "userId is required."),
        role: z.enum(TENANT_PROJECT_ROLES),
      }),
    )
    .default([]),
})

interface CreateTenantProjectPayload {
  name: string
  environment: (typeof TENANT_PROJECT_ENVIRONMENTS)[number]
  description: string
  quotaPolicyMode: "tenant_default" | "custom"
  quotaPolicyJson: string | null
  initialMembers: Array<{
    userId: string
    role: (typeof TENANT_PROJECT_ROLES)[number]
  }>
}

function toPayload(input: CreateTenantProjectInput): {
  tenantId: string
  body: CreateTenantProjectPayload
} {
  const parsed = CreateTenantProjectInputSchema.parse(input)

  return {
    tenantId: parsed.tenantId,
    body: {
      name: parsed.name,
      environment: parsed.environment,
      description: parsed.description,
      quotaPolicyMode: parsed.quotaPolicyMode,
      quotaPolicyJson:
        parsed.quotaPolicyMode === "custom" ? (parsed.quotaPolicyJson?.trim() ?? null) : null,
      initialMembers: parsed.initialMembers.map((member) => ({
        userId: member.userId,
        role: member.role,
      })),
    },
  }
}

export async function createTenantProject(
  input: CreateTenantProjectInput,
): Promise<CreateTenantProjectResponse> {
  const payload = toPayload(input)

  const json = await api
    .withTenantId()
    .post(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/projects`, {
      json: payload.body,
    })
    .json()

  return json as CreateTenantProjectResponse
}
