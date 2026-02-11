import { addMinutes } from "date-fns"
import { delay, HttpResponse, http } from "msw"
import { mockRegistry } from "@/packages/mock-core"
import type {
  TenantProjectItem,
  TenantProjectMemberCandidate,
  TenantProjectOwnerOption,
  TenantProjectRole,
  TenantProjectsListResponse,
} from "../types/tenant-projects"
import { buildProjectIdFromName, normalizeProjectName } from "../utils/tenant-projects-formatters"
import { TENANT_PROJECT_SEEDS, type TenantProjectSeed } from "./tenant-projects.mock.seed"
import {
  applyFilters,
  applySort,
  paginateProjects,
  parseEnvironment,
  parseFilters,
  parseInitialMembers,
  parsePositiveInt,
  parseSort,
} from "./tenant-projects.mock.utils"

interface TenantProjectStoreState {
  canCreateProject: boolean
  ownerOptions: TenantProjectOwnerOption[]
  memberCandidates: TenantProjectMemberCandidate[]
  projects: TenantProjectItem[]
}

const tenantProjectStore = new Map<string, TenantProjectStoreState>()
const DEFAULT_TENANT_PROJECT_SEED = TENANT_PROJECT_SEEDS["1"] as TenantProjectSeed

function cloneProject(project: TenantProjectItem): TenantProjectItem {
  return {
    ...project,
    serviceSummary: {
      ...project.serviceSummary,
    },
    deletionPreview: {
      ...project.deletionPreview,
      dependencies: project.deletionPreview.dependencies.map((dependency) => ({
        ...dependency,
      })),
    },
  }
}

function cloneStoreState(seed: TenantProjectSeed): TenantProjectStoreState {
  return {
    canCreateProject: seed.canCreateProject,
    ownerOptions: seed.ownerOptions.map((owner) => ({ ...owner })),
    memberCandidates: seed.memberCandidates.map((candidate) => ({ ...candidate })),
    projects: seed.projects.map((project) => cloneProject(project)),
  }
}

function getStoreState(tenantId: string): TenantProjectStoreState {
  const existingState = tenantProjectStore.get(tenantId)
  if (existingState) {
    return existingState
  }

  const seed = TENANT_PROJECT_SEEDS[tenantId] ?? DEFAULT_TENANT_PROJECT_SEED
  const nextState = cloneStoreState(seed)
  tenantProjectStore.set(tenantId, nextState)
  return nextState
}

function resolveOwner(
  initialMembers: Array<{ userId: string; role: TenantProjectRole }>,
  state: TenantProjectStoreState,
) {
  const ownerMember = initialMembers.find((member) => member.role === "Owner")
  if (ownerMember) {
    const matchedOwner = state.ownerOptions.find((owner) => owner.userId === ownerMember.userId)
    if (matchedOwner) {
      return matchedOwner
    }
  }

  return (
    state.ownerOptions[0] ?? {
      userId: "unknown-owner",
      displayName: "未知 Owner",
      email: "unknown@example.com",
    }
  )
}

function buildListResponse(
  state: TenantProjectStoreState,
  projects: TenantProjectItem[],
  pageNumber: number,
  pageSize: number,
): TenantProjectsListResponse {
  const paginated = paginateProjects(projects, pageNumber, pageSize)

  return {
    ...paginated,
    content: paginated.content.map((project) => cloneProject(project)),
    canCreateProject: state.canCreateProject,
    ownerOptions: state.ownerOptions.map((owner) => ({ ...owner })),
    memberCandidates: state.memberCandidates.map((candidate) => ({ ...candidate })),
    existingProjectNames: state.projects.map((project) => project.projectName),
  }
}

export const tenantProjectsHandlers = [
  http.get("*/infera-api/tenants/:tenantId/projects", async ({ params, request }) => {
    await delay(280)

    const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
    const state = getStoreState(tenantId)
    const url = new URL(request.url)

    const pageNumber = parsePositiveInt(url.searchParams.get("pageNumber"), 1)
    const pageSize = parsePositiveInt(url.searchParams.get("pageSize"), 20)
    const filters = parseFilters(url)
    const sort = parseSort(url.searchParams.get("sort"))

    const filteredProjects = applyFilters(state.projects, filters)
    const sortedProjects = applySort(filteredProjects, sort)

    return HttpResponse.json(buildListResponse(state, sortedProjects, pageNumber, pageSize))
  }),
  http.post("*/infera-api/tenants/:tenantId/projects", async ({ params, request }) => {
    await delay(420)

    const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
    const state = getStoreState(tenantId)

    if (!state.canCreateProject) {
      return HttpResponse.json(
        {
          title: "forbidden",
          detail: "当前租户策略不允许创建项目。",
        },
        { status: 403 },
      )
    }

    const payload = (await request.json()) as Record<string, unknown>
    const name = typeof payload.name === "string" ? payload.name.trim() : ""
    const normalizedName = normalizeProjectName(name)
    if (normalizedName.length < 2) {
      return HttpResponse.json(
        {
          title: "validation_error",
          detail: "项目名称至少 2 个字符。",
        },
        { status: 400 },
      )
    }

    const duplicated = state.projects.some(
      (project) => normalizeProjectName(project.projectName) === normalizedName,
    )
    if (duplicated) {
      return HttpResponse.json(
        {
          title: "project_name_conflict",
          detail: "项目名称已存在，请更换后重试。",
        },
        { status: 409 },
      )
    }

    const environment = parseEnvironment(payload.environment)
    const initialMembers = parseInitialMembers(payload.initialMembers)
    const owner = resolveOwner(initialMembers, state)
    const nextIndex = state.projects.length + 1
    let projectId = buildProjectIdFromName(name)
    while (state.projects.some((project) => project.projectId === projectId)) {
      projectId = `${projectId}-${nextIndex}`
    }

    const createdProject: TenantProjectItem = {
      projectId,
      projectName: name,
      environment,
      ownerId: owner.userId,
      ownerName: owner.displayName,
      serviceSummary: {
        ready: 0,
        total: 0,
      },
      monthlyEstimatedCostCny: 0,
      tokensToday: 0,
      updatedAt: addMinutes(new Date(), nextIndex).toISOString(),
      deletionPreview: {
        policy: "allow",
        dependencies: [],
      },
    }

    state.projects.unshift(createdProject)

    return HttpResponse.json(
      {
        project: cloneProject(createdProject),
      },
      { status: 201 },
    )
  }),
  http.delete("*/infera-api/tenants/:tenantId/projects/:projectId", async ({ params }) => {
    await delay(360)

    const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
    const projectId = typeof params.projectId === "string" ? params.projectId : ""
    const state = getStoreState(tenantId)
    const targetProject = state.projects.find((project) => project.projectId === projectId)

    if (!targetProject) {
      return HttpResponse.json(
        {
          title: "not_found",
          detail: "项目不存在。",
        },
        { status: 404 },
      )
    }

    if (targetProject.deletionPreview.policy === "blocked") {
      return HttpResponse.json(
        {
          title: "resource_in_use",
          detail: "resource_in_use",
          data: {
            dependencies: targetProject.deletionPreview.dependencies,
          },
        },
        { status: 409 },
      )
    }

    state.projects = state.projects.filter((project) => project.projectId !== projectId)
    return new HttpResponse(null, { status: 204 })
  }),
]

mockRegistry.register(...tenantProjectsHandlers)
