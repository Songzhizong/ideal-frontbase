import { z } from "zod"
import { api } from "@/features/core/api"
import {
  PROJECT_DASHBOARD_RANGES,
  type ProjectDashboardRange,
  type ProjectDashboardResponse,
} from "../types/project-dashboard"

const ProjectDashboardRangeSchema = z.enum(PROJECT_DASHBOARD_RANGES)

const GetProjectDashboardInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  projectId: z.string().min(1, "projectId is required."),
  range: ProjectDashboardRangeSchema.default("24h"),
})

export type GetProjectDashboardInput = z.input<typeof GetProjectDashboardInputSchema>

interface GetProjectDashboardPayload {
  tenantId: string
  projectId: string
  range: ProjectDashboardRange
}

function toPayload(input: GetProjectDashboardInput): GetProjectDashboardPayload {
  return GetProjectDashboardInputSchema.parse(input)
}

export async function getProjectDashboard(
  input: GetProjectDashboardInput,
): Promise<ProjectDashboardResponse> {
  const payload = toPayload(input)

  const json = await api
    .withTenantId()
    .get(
      `infera-api/tenants/${encodeURIComponent(payload.tenantId)}/projects/${encodeURIComponent(payload.projectId)}/dashboard`,
      {
        searchParams: {
          range: payload.range,
        },
      },
    )
    .json()

  return json as ProjectDashboardResponse
}
