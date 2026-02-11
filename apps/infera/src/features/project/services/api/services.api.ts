import type {
  ProjectServiceDetail,
  ProjectServiceSummary,
  ServiceFilterState,
  ServiceWizardOptions,
} from "../types"
import { ensureStore } from "./services.store"

function toSummary(service: ProjectServiceDetail): ProjectServiceSummary {
  return {
    serviceId: service.serviceId,
    name: service.name,
    description: service.description,
    env: service.env,
    currentState: service.currentState,
    desiredState: service.desiredState,
    endpoint: service.endpoint,
    modelVersionId: service.modelVersionId,
    runtime: service.runtime,
    replicas: { ...service.replicas },
    metrics1h: { ...service.metrics1h },
    updatedAt: service.updatedAt,
  }
}

function matchErrorRate(errorRate: number, range: ServiceFilterState["errorRateRange"]) {
  if (range === "all") {
    return true
  }
  if (range === "lt1") {
    return errorRate < 1
  }
  if (range === "1to5") {
    return errorRate >= 1 && errorRate <= 5
  }
  return errorRate > 5
}

export async function getProjectServices(
  tenantId: string,
  projectId: string,
  filters: ServiceFilterState,
): Promise<ProjectServiceSummary[]> {
  const currentStore = ensureStore(tenantId, projectId)
  const query = filters.q.trim().toLowerCase()

  return currentStore.services
    .filter((service) => {
      if (filters.env !== "All" && service.env !== filters.env) {
        return false
      }
      if (filters.state !== "All" && service.currentState !== filters.state) {
        return false
      }
      if (filters.runtime !== "All" && service.runtime !== filters.runtime) {
        return false
      }
      if (filters.model !== "All" && service.modelVersionId !== filters.model) {
        return false
      }
      if (filters.onlyInactive === "yes" && service.desiredState !== "Inactive") {
        return false
      }
      if (filters.onlyInactive === "no" && service.desiredState === "Inactive") {
        return false
      }
      if (!matchErrorRate(service.metrics1h.errorRate, filters.errorRateRange)) {
        return false
      }

      if (query.length > 0) {
        const target = `${service.name} ${service.description} ${service.endpoint} ${service.modelVersionId} ${service.runtime}`
        if (!target.toLowerCase().includes(query)) {
          return false
        }
      }

      return true
    })
    .map((service) => toSummary(structuredClone(service)))
}

export async function getProjectServiceDetail(
  tenantId: string,
  projectId: string,
  serviceId: string,
): Promise<ProjectServiceDetail> {
  const target = ensureStore(tenantId, projectId).services.find(
    (item) => item.serviceId === serviceId,
  )
  if (!target) {
    throw new Error("服务不存在")
  }
  return structuredClone(target)
}

export async function getProjectServiceWizardOptions(
  tenantId: string,
  projectId: string,
): Promise<ServiceWizardOptions> {
  const options = ensureStore(tenantId, projectId).wizardOptions
  return structuredClone(options)
}
