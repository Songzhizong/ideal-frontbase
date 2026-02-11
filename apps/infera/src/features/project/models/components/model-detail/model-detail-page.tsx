import { BadgeCheck, Rocket, Tags, Trash2, Upload } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ContentLayout } from "@/components/content-layout"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { DangerConfirmDialog, EmptyState, ErrorState, TagChips } from "@/features/shared/components"
import { BaseLink, useBaseNavigate } from "@/packages/platform-router"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { isModelDependencyConflict } from "../../api"
import { useProjectModelActions, useProjectModelDetailQuery } from "../../hooks"
import type {
  ModelDependencyConflict,
  ModelTagItem,
  ModelVersionItem,
} from "../../types/project-models"
import { UploadModelWizard } from "../upload-model-wizard"
import { ModelDependencyConflictDialog } from "./model-dependency-conflict-dialog"
import { ModelDetailTabs } from "./model-detail-tabs"
import { ModelVersionDetailDrawer } from "./model-version-detail-drawer"
import { PromoteTagDialog } from "./promote-tag-dialog"

interface ModelDetailPageProps {
  tenantId: string
  projectId: string
  modelId: string
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return "操作失败，请稍后重试。"
}

export function ModelDetailPage({ tenantId, projectId, modelId }: ModelDetailPageProps) {
  const navigate = useBaseNavigate()
  const query = useProjectModelDetailQuery(tenantId, projectId, modelId)
  const actions = useProjectModelActions({ tenantId, projectId, modelId })
  const [activeTab, setActiveTab] = useState("overview")
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<ModelVersionItem | null>(null)
  const [promoteTag, setPromoteTag] = useState<ModelTagItem | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteVersionTarget, setDeleteVersionTarget] = useState<ModelVersionItem | null>(null)
  const [deleteModelOpen, setDeleteModelOpen] = useState(false)
  const [dependencyConflict, setDependencyConflict] = useState<ModelDependencyConflict | null>(null)
  const [dependencyOpen, setDependencyOpen] = useState(false)

  const model = query.data

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild className="cursor-pointer">
        <BaseLink to={buildProjectPath(tenantId, projectId, "/services")}>
          <Rocket className="size-4" aria-hidden />
          部署为服务
        </BaseLink>
      </Button>
      <Button variant="outline" onClick={() => setUploadOpen(true)} className="cursor-pointer">
        <Upload className="size-4" aria-hidden />
        上传新版本
      </Button>
      <Button variant="outline" onClick={() => setActiveTab("tags")} className="cursor-pointer">
        <Tags className="size-4" aria-hidden />
        管理 Tags
      </Button>
      <Button
        variant="destructive"
        onClick={() => setDeleteModelOpen(true)}
        className="cursor-pointer"
      >
        <Trash2 className="size-4" aria-hidden />
        删除模型
      </Button>
    </div>
  )

  return (
    <>
      <ContentLayout
        title={model ? model.name : "模型详情"}
        description="查看模型版本、Tag 流转、依赖服务和审计记录。"
        actions={headerActions}
      >
        {query.isPending ? (
          <div className="rounded-lg border border-border/50 bg-card p-6 text-sm text-muted-foreground">
            模型详情加载中...
          </div>
        ) : null}

        {query.isError ? (
          <ErrorState
            title="模型详情加载失败"
            message="请稍后重试或返回列表页检查模型是否存在。"
            error={query.error}
            onRetry={() => {
              void query.refetch()
            }}
          />
        ) : null}

        {!query.isPending && !query.isError && model ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{model.source}</Badge>
                <Badge variant="outline">{model.visibility}</Badge>
                <Badge className="border-violet-200 bg-violet-500/10 text-violet-500">
                  <BadgeCheck className="mr-1 size-3" aria-hidden />
                  {model.parameterContextSummary}
                </Badge>
              </div>
              <div className="mt-3">
                <TagChips
                  tags={model.tags.map((tag) => ({
                    name: tag.tagName,
                    versionId: tag.versionId,
                  }))}
                />
              </div>
            </div>

            <ModelDetailTabs
              model={model}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onViewVersion={(version) => {
                setSelectedVersion(version)
                setVersionDrawerOpen(true)
              }}
              onDeleteVersion={(version) => setDeleteVersionTarget(version)}
              onPromoteTag={(tag) => setPromoteTag(tag)}
            />
          </div>
        ) : null}

        {!query.isPending && !query.isError && !model ? (
          <EmptyState
            title="模型不存在"
            description="当前模型可能已删除，请返回列表页确认。"
            primaryAction={{
              label: "返回模型库",
              onClick: () => {
                void navigate({ to: buildProjectPath(tenantId, projectId, "/models") })
              },
            }}
          />
        ) : null}
      </ContentLayout>

      <ModelVersionDetailDrawer
        open={versionDrawerOpen}
        onOpenChange={setVersionDrawerOpen}
        version={selectedVersion}
      />

      <PromoteTagDialog
        open={promoteTag !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPromoteTag(null)
          }
        }}
        tag={promoteTag}
        versions={model?.versions ?? []}
        submitting={actions.promoteTagMutation.isPending}
        onPromote={async ({ targetVersionId, force, reason }) => {
          if (!promoteTag) {
            return
          }
          try {
            const result = await actions.promoteTagMutation.mutateAsync({
              tenantId,
              projectId,
              modelId,
              tagName: promoteTag.tagName,
              targetVersionId,
              force,
              reason,
            })
            if (!result.allowed) {
              toast.error(result.reason ?? "Gate 校验失败")
            }
          } catch (error) {
            toast.error(toErrorMessage(error))
          }
        }}
      />

      <UploadModelWizard
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        tenantId={tenantId}
        projectId={projectId}
        existingModels={model ? [model] : []}
        submitting={actions.uploadModelMutation.isPending}
        onSubmit={async (payload) => {
          try {
            await actions.uploadModelMutation.mutateAsync(payload)
          } catch (error) {
            toast.error(toErrorMessage(error))
          }
        }}
      />

      <DangerConfirmDialog
        open={deleteVersionTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteVersionTarget(null)
          }
        }}
        targetName={deleteVersionTarget?.modelVersionId ?? ""}
        title="删除模型版本"
        description="删除前会进行依赖检查，若版本被服务引用将阻止操作。"
        confirmLabel="确认删除版本"
        onConfirm={async () => {
          if (!deleteVersionTarget) {
            return
          }
          try {
            await actions.deleteVersionMutation.mutateAsync({
              tenantId,
              projectId,
              modelId,
              modelVersionId: deleteVersionTarget.modelVersionId,
            })
            setDeleteVersionTarget(null)
          } catch (error) {
            if (isModelDependencyConflict(error)) {
              setDependencyConflict(error.conflict)
              setDependencyOpen(true)
              setDeleteVersionTarget(null)
              return
            }
            toast.error(toErrorMessage(error))
          }
        }}
      />

      <DangerConfirmDialog
        open={deleteModelOpen}
        onOpenChange={setDeleteModelOpen}
        targetName={model?.name ?? ""}
        title="删除模型"
        description="删除模型会移除其下所有版本，且不可恢复。"
        confirmLabel="确认删除模型"
        onConfirm={async () => {
          try {
            await actions.deleteModelMutation.mutateAsync({ tenantId, projectId, modelId })
            void navigate({ to: buildProjectPath(tenantId, projectId, "/models") })
          } catch (error) {
            if (isModelDependencyConflict(error)) {
              setDependencyConflict(error.conflict)
              setDependencyOpen(true)
              return
            }
            toast.error(toErrorMessage(error))
          }
        }}
      />

      <ModelDependencyConflictDialog
        open={dependencyOpen}
        onOpenChange={setDependencyOpen}
        conflict={dependencyConflict}
        servicePathPrefix={buildProjectPath(tenantId, projectId, "/services")}
      />
    </>
  )
}
