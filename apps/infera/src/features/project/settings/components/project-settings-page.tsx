import { useState } from "react"
import { toast } from "sonner"
import { buildTenantPath } from "@/components/workspace/workspace-context"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { useBaseNavigate } from "@/hooks"
import { ContentLayout } from "@/packages/layout-core"
import { Button } from "@/packages/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs"
import { useProjectSettingsActions, useProjectSettingsQuery } from "../hooks"
import type { ProjectEnvironmentPolicies } from "../types/project-settings"
import { ProjectDangerZoneTab } from "./project-danger-zone-tab"
import { ProjectEnvironmentPoliciesTab } from "./project-environment-policies-tab"
import { ProjectMembersTab } from "./project-members-tab"
import { ProjectQuotasBudgetsTab } from "./project-quotas-budgets-tab"
import { ProjectServiceAccountsTab } from "./project-service-accounts-tab"
import { ProjectSettingsOverviewTab } from "./project-settings-overview-tab"

interface ProjectSettingsPageProps {
  tenantId: string
  projectId: string
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return "操作失败，请稍后重试。"
}

export function ProjectSettingsPage({ tenantId, projectId }: ProjectSettingsPageProps) {
  const navigate = useBaseNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [environmentPoliciesDraft, setEnvironmentPoliciesDraft] =
    useState<ProjectEnvironmentPolicies | null>(null)

  const query = useProjectSettingsQuery(tenantId, projectId)
  const actions = useProjectSettingsActions({ tenantId, projectId })

  const data = query.data
  const policies = environmentPoliciesDraft ?? data?.environmentPolicies ?? null

  const headerActions = (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        void query.refetch()
      }}
      disabled={query.isFetching}
      className="cursor-pointer"
    >
      刷新
    </Button>
  )

  return (
    <ContentLayout
      title="项目设置"
      description="管理项目元信息、成员、服务账号与环境策略，所有写操作均可追溯到审计日志。"
      actions={headerActions}
    >
      {query.isPending ? (
        <div className="rounded-lg border border-border/50 bg-card p-6 text-sm text-muted-foreground">
          正在加载项目设置...
        </div>
      ) : null}

      {query.isError ? (
        <ErrorState
          title="项目设置加载失败"
          message="无法获取项目设置数据，请稍后重试。"
          error={query.error}
          onRetry={() => {
            void query.refetch()
          }}
        />
      ) : null}

      {!query.isPending && !query.isError && data ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="cursor-pointer px-4">
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="cursor-pointer px-4">
              Members
            </TabsTrigger>
            <TabsTrigger value="service-accounts" className="cursor-pointer px-4">
              Service Accounts
            </TabsTrigger>
            <TabsTrigger value="quota-policy" className="cursor-pointer px-4">
              Quotas & Budgets
            </TabsTrigger>
            <TabsTrigger value="environment" className="cursor-pointer px-4">
              Env Policies
            </TabsTrigger>
            <TabsTrigger value="danger" className="cursor-pointer px-4 text-destructive">
              Danger Zone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 border-none p-0 outline-none">
            <ProjectSettingsOverviewTab
              overview={data.overview}
              saving={actions.updateOverviewMutation.isPending}
              onSave={async (input) => {
                try {
                  await actions.updateOverviewMutation.mutateAsync({
                    tenantId,
                    projectId,
                    ...input,
                  })
                } catch (error) {
                  toast.error(toErrorMessage(error))
                }
              }}
            />
          </TabsContent>

          <TabsContent value="members" className="space-y-4 border-none p-0 outline-none">
            <ProjectMembersTab
              members={data.members}
              adding={actions.addMemberMutation.isPending}
              updating={actions.updateMemberRoleMutation.isPending}
              removing={actions.removeMemberMutation.isPending}
              onAddMember={async (input) => {
                try {
                  await actions.addMemberMutation.mutateAsync({ tenantId, projectId, ...input })
                } catch (error) {
                  toast.error(toErrorMessage(error))
                }
              }}
              onUpdateRole={async (memberId, role) => {
                try {
                  await actions.updateMemberRoleMutation.mutateAsync({
                    tenantId,
                    projectId,
                    memberId,
                    role,
                  })
                } catch (error) {
                  toast.error(toErrorMessage(error))
                }
              }}
              onRemoveMember={async (memberId) => {
                try {
                  await actions.removeMemberMutation.mutateAsync({
                    tenantId,
                    projectId,
                    memberId,
                  })
                } catch (error) {
                  toast.error(toErrorMessage(error))
                }
              }}
            />
          </TabsContent>

          <TabsContent value="service-accounts" className="space-y-4 border-none p-0 outline-none">
            <ProjectServiceAccountsTab
              items={data.serviceAccounts}
              creating={actions.createServiceAccountMutation.isPending}
              rotating={actions.rotateServiceAccountTokenMutation.isPending}
              toggling={actions.toggleServiceAccountMutation.isPending}
              deleting={actions.deleteServiceAccountMutation.isPending}
              onCreate={async (input) => {
                try {
                  await actions.createServiceAccountMutation.mutateAsync({
                    tenantId,
                    projectId,
                    ...input,
                  })
                } catch (error) {
                  toast.error(toErrorMessage(error))
                }
              }}
              onRotateToken={async (serviceAccountId, disableOldToken) => {
                const result = await actions.rotateServiceAccountTokenMutation.mutateAsync({
                  tenantId,
                  projectId,
                  serviceAccountId,
                  disableOldToken,
                })
                return result.secret
              }}
              onToggleStatus={async (serviceAccountId, nextStatus) => {
                try {
                  await actions.toggleServiceAccountMutation.mutateAsync({
                    tenantId,
                    projectId,
                    serviceAccountId,
                    nextStatus,
                  })
                } catch (error) {
                  toast.error(toErrorMessage(error))
                }
              }}
              onDelete={async (serviceAccountId) => {
                try {
                  await actions.deleteServiceAccountMutation.mutateAsync({
                    tenantId,
                    projectId,
                    serviceAccountId,
                  })
                } catch (error) {
                  toast.error(toErrorMessage(error))
                }
              }}
            />
          </TabsContent>

          <TabsContent value="quota-policy" className="space-y-4 border-none p-0 outline-none">
            <ProjectQuotasBudgetsTab
              policy={data.quotaBudgetPolicy}
              saving={actions.saveQuotaPolicyMutation.isPending}
              onSave={async (policy) => {
                try {
                  await actions.saveQuotaPolicyMutation.mutateAsync({
                    tenantId,
                    projectId,
                    policy,
                  })
                } catch (error) {
                  toast.error(toErrorMessage(error))
                }
              }}
            />
          </TabsContent>

          <TabsContent value="environment" className="space-y-4 border-none p-0 outline-none">
            {policies ? (
              <ProjectEnvironmentPoliciesTab
                policies={policies}
                saving={actions.saveEnvironmentPoliciesMutation.isPending}
                onChange={(next) => setEnvironmentPoliciesDraft(next)}
                onSave={async () => {
                  try {
                    await actions.saveEnvironmentPoliciesMutation.mutateAsync({
                      tenantId,
                      projectId,
                      policies,
                    })
                  } catch (error) {
                    toast.error(toErrorMessage(error))
                  }
                }}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="danger" className="space-y-4 border-none p-0 outline-none">
            <ProjectDangerZoneTab
              overview={data.overview}
              deleting={actions.deleteProjectMutation.isPending}
              onDeleteProject={async () => {
                try {
                  await actions.deleteProjectMutation.mutateAsync({ tenantId, projectId })
                  void navigate({ to: buildTenantPath(tenantId, "/projects") })
                } catch (error) {
                  toast.error(toErrorMessage(error))
                }
              }}
            />
          </TabsContent>
        </Tabs>
      ) : null}

      {!query.isPending && !query.isError && !data ? (
        <EmptyState title="暂无项目设置" description="当前项目配置为空，请刷新后重试。" />
      ) : null}
    </ContentLayout>
  )
}
