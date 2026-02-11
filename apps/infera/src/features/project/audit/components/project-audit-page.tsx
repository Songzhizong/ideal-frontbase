import { TenantAuditPage } from "@/features/tenant/audit"

interface ProjectAuditPageProps {
  tenantId: string
  projectId: string
}

export function ProjectAuditPage({ tenantId, projectId }: ProjectAuditPageProps) {
  return (
    <TenantAuditPage
      tenantId={tenantId}
      title="项目审计"
      description="默认过滤当前项目，支持按资源类型细分检索审计事件并查看 before/after 变更细节。"
      lockedProjectId={projectId}
      showProjectFilter={false}
    />
  )
}
